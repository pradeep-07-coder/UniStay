const db = require('../db');
const cloudinary = require('../config/cloudinary');

// Helper function to upload image buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'unistay_accommodations' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Create Accommodation with Multiple Images & Extra Details
exports.createAccommodation = async (req, res) => {
  const owner_id = req.user.id;
  const { 
    title, description, street, city, district, latitude, longitude, 
    price_per_month, university_id, room_type, total_rooms, ac_status, rules_and_facilities 
  } = req.body;

  try {
    let image_urls = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
        image_urls = await Promise.all(uploadPromises);
      } catch (uploadErr) {
        console.error('Cloudinary accommodation upload error:', uploadErr);
        image_urls = ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'];
      }
    }

    const parsedUniId = university_id ? parseInt(university_id, 10) : null;
    const parsedPrice = price_per_month ? parseFloat(price_per_month) : 0;
    const parsedRooms = total_rooms ? parseInt(total_rooms, 10) : 1;
    let finalLat = latitude ? parseFloat(latitude) : null;
    let finalLng = longitude ? parseFloat(longitude) : null;

    if ((!finalLat || !finalLng) && parsedUniId) {
      const uniRes = await db.query('SELECT latitude, longitude FROM UNIVERSITY WHERE university_id = $1', [parsedUniId]);
      if (uniRes.rows.length > 0) {
        finalLat = finalLat || parseFloat(uniRes.rows[0].latitude);
        finalLng = finalLng || parseFloat(uniRes.rows[0].longitude);
      }
    }
    if (!finalLat || !finalLng) {
      finalLat = 6.7951;
      finalLng = 79.9009;
    }

    const primary_image_url = image_urls.length > 0 ? image_urls[0] : null;

    const result = await db.query(
      `INSERT INTO ACCOMMODATION 
       (owner_id, university_id, title, description, street, city, district, latitude, longitude, price_per_month, image_url, image_urls, room_type, total_rooms, ac_status, rules_and_facilities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [owner_id, parsedUniId, title, description, street, city, district, finalLat, finalLng, parsedPrice, primary_image_url, image_urls, room_type || 'Single', parsedRooms, ac_status === true || ac_status === 'true', rules_and_facilities]
    );

    res.status(201).json({ status: 'success', data: { accommodation: result.rows[0] } });
  } catch (err) {
    console.error('Create Accommodation Error:', err);
    res.status(500).json({ status: 'error', message: err.message || 'Failed to create listing' });
  }
};

// Search Accommodations by University Radius & Sort by Distance
exports.getAllAccommodations = async (req, res) => {
  const { university_id, maxPrice } = req.query;

  try {
    let query = `
      SELECT a.*, po.first_name, po.last_name, po.phone_number, po.email, u.name AS university_name
    `;
    const params = [];

    if (university_id) {
      params.push(university_id);
      // Haversine Distance Calculation in Kilometers (with safe clamping)
      query += `,
        (6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(u.latitude)) * cos(radians(a.latitude)) * 
            cos(radians(a.longitude) - radians(u.longitude)) + 
            sin(radians(u.latitude)) * sin(radians(a.latitude))
          ))
        )) AS distance_km
        FROM ACCOMMODATION a
        JOIN PROPERTY_OWNER po ON a.owner_id = po.owner_id
        LEFT JOIN UNIVERSITY u ON a.university_id = u.university_id
        WHERE a.availability_status = true AND a.university_id = $1
      `;

      if (maxPrice) {
        params.push(maxPrice);
        query += ` AND a.price_per_month <= $${params.length}`;
      }

      // Filter within 5km radius & sort from closest to farthest
      query += ` AND (6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(u.latitude)) * cos(radians(a.latitude)) * 
            cos(radians(a.longitude) - radians(u.longitude)) + 
            sin(radians(u.latitude)) * sin(radians(a.latitude))
          ))
        )) <= 5.0
        ORDER BY distance_km ASC`;
    } else {
      query += `
        FROM ACCOMMODATION a
        JOIN PROPERTY_OWNER po ON a.owner_id = po.owner_id
        LEFT JOIN UNIVERSITY u ON a.university_id = u.university_id
        WHERE a.availability_status = true
      `;
      if (maxPrice) {
        params.push(maxPrice);
        query += ` AND a.price_per_month <= $${params.length}`;
      }
      query += ` ORDER BY a.created_at DESC`;
    }

    const result = await db.query(query, params);
    res.status(200).json({ status: 'success', results: result.rows.length, data: { accommodations: result.rows } });
  } catch (err) {
    console.error('Get Accommodations Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve accommodations' });
  }
};

// 3. Get Single Accommodation by ID
exports.getAccommodationById = async (req, res) => {
  const { id } = req.params;

  try {
    const accResult = await db.query(
      `SELECT a.*, po.first_name, po.last_name, po.phone_number, po.email, u.name AS university_name 
       FROM ACCOMMODATION a
       JOIN PROPERTY_OWNER po ON a.owner_id = po.owner_id
       LEFT JOIN UNIVERSITY u ON a.university_id = u.university_id
       WHERE a.accommodation_id = $1`,
      [id]
    );

    if (accResult.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Listing not found' });
    }

    const reviewsResult = await db.query(
      `SELECT r.*, s.first_name, s.last_name 
       FROM REVIEW r
       JOIN STUDENT s ON r.student_id = s.student_id
       WHERE r.accommodation_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        accommodation: accResult.rows[0],
        reviews: reviewsResult.rows,
      },
    });
  } catch (err) {
    console.error('Get Accommodation Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/* exports.getAccommodationById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT a.*, po.first_name, po.last_name, po.phone_number, po.email 
       FROM ACCOMMODATION a
       JOIN PROPERTY_OWNER po ON a.owner_id = po.owner_id
       WHERE a.accommodation_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Accommodation listing not found' });
    }

    res.status(200).json({ status: 'success', data: { accommodation: result.rows[0] } });
  } catch (err) {
    console.error('Get Accommodation Details Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}; */

// 4. Get Owner's Own Accommodation Listings
exports.getMyAccommodations = async (req, res) => {
  const owner_id = req.user.id;

  try {
    const result = await db.query(
      'SELECT * FROM ACCOMMODATION WHERE owner_id = $1 ORDER BY created_at DESC',
      [owner_id]
    );
    res.status(200).json({ status: 'success', results: result.rows.length, data: { accommodations: result.rows } });
  } catch (err) {
    console.error('Get Owner Accommodations Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch owner accommodations' });
  }
};

// 5. Update Accommodation Listing
exports.updateAccommodation = async (req, res) => {
  const { id } = req.params;
  const owner_id = req.user.id;
  const { 
    title, description, street, city, district, latitude, longitude, 
    price_per_month, availability_status, room_type, total_rooms, ac_status, 
    rules_and_facilities, university_id 
  } = req.body;

  try {
    // Check ownership
    const check = await db.query('SELECT * FROM ACCOMMODATION WHERE accommodation_id = $1 AND owner_id = $2', [id, owner_id]);
    if (check.rows.length === 0) {
      return res.status(403).json({ status: 'fail', message: 'Listing not found or unauthorized' });
    }

    let image_urls = check.rows[0].image_urls || (check.rows[0].image_url ? [check.rows[0].image_url] : []);
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      image_urls = await Promise.all(uploadPromises);
    } else if (req.file) {
      const singleUrl = await uploadToCloudinary(req.file.buffer);
      image_urls = [singleUrl];
    }
    const primary_image_url = image_urls.length > 0 ? image_urls[0] : check.rows[0].image_url;

    const result = await db.query(
      `UPDATE ACCOMMODATION 
       SET title = $1, description = $2, street = $3, city = $4, district = $5,
           latitude = $6, longitude = $7, price_per_month = $8, availability_status = $9, 
           image_url = $10, image_urls = $11, room_type = $12, total_rooms = $13, 
           ac_status = $14, rules_and_facilities = $15, university_id = $16
       WHERE accommodation_id = $17 AND owner_id = $18
       RETURNING *`,
      [
        title, description, street, city, district, 
        latitude, longitude, price_per_month, availability_status, 
        primary_image_url, image_urls, room_type || 'Single', total_rooms || 1, 
        ac_status === true || ac_status === 'true', rules_and_facilities, university_id || null, 
        id, owner_id
      ]
    );

    res.status(200).json({ status: 'success', data: { accommodation: result.rows[0] } });
  } catch (err) {
    console.error('Update Accommodation Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update accommodation' });
  }
};

// 6. Delete Accommodation Listing
exports.deleteAccommodation = async (req, res) => {
  const { id } = req.params;
  const owner_id = req.user.id;

  try {
    const result = await db.query(
      'DELETE FROM ACCOMMODATION WHERE accommodation_id = $1 AND owner_id = $2 RETURNING *',
      [id, owner_id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ status: 'fail', message: 'Listing not found or unauthorized' });
    }

    res.status(200).json({ status: 'success', message: 'Listing successfully deleted' });
  } catch (err) {
    console.error('Delete Accommodation Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete listing' });
  }
};

// Add / Update Review
exports.addReview = async (req, res) => {
  const student_id = req.user.id;
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const existing = await db.query(
      'SELECT review_id FROM REVIEW WHERE student_id = $1 AND accommodation_id = $2',
      [student_id, id]
    );

    if (existing.rows.length > 0) {
      const updated = await db.query(
        `UPDATE REVIEW 
         SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP 
         WHERE review_id = $3 
         RETURNING *`,
        [rating, comment, existing.rows[0].review_id]
      );
      return res.status(200).json({ status: 'success', data: { review: updated.rows[0] } });
    }

    const result = await db.query(
      `INSERT INTO REVIEW (student_id, accommodation_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [student_id, id, rating, comment]
    );

    res.status(201).json({ status: 'success', data: { review: result.rows[0] } });
  } catch (err) {
    console.error('Add Review Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to post review' });
  }
};
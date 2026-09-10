const db = require('../db');
const cloudinary = require('../config/cloudinary');

// Helper function to stream Multer buffer directly to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'unistay_food_items' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// 1. Create Meal Plan with Location & Image
exports.createMealPlan = async (req, res) => {
  const provider_id = req.user.id;
  const { 
    plan_name, description, price, university_id, 
    address, city, phone_number, latitude, longitude 
  } = req.body;

  try {
    let image_url = req.body.image_url || null;

    if (req.file) {
      try {
        image_url = await uploadToCloudinary(req.file.buffer);
      } catch (uploadErr) {
        console.error('Cloudinary meal plan image upload error:', uploadErr);
      }
    }

    const planPrice = price !== undefined && price !== '' ? parseFloat(price) : 0;

    const result = await db.query(
      `INSERT INTO MEAL_PLAN 
       (provider_id, university_id, plan_name, description, price, address, city, phone_number, latitude, longitude, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [provider_id, university_id || null, plan_name, description, planPrice, address, city, phone_number, latitude, longitude, image_url]
    );

    res.status(201).json({ status: 'success', data: { meal_plan: result.rows[0] } });
  } catch (err) {
    console.error('Create Meal Plan Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to create meal plan.' });
  }
};

// 2. Add Food Item to Meal Plan (With Image Upload)
exports.addFoodItem = async (req, res) => {
  const provider_id = req.user.id;
  const { meal_plan_id, food_name, price, category } = req.body;

  // Validation
  if (!meal_plan_id || !food_name || !price || !category) {
    return res.status(400).json({
      status: 'fail',
      message: 'Meal Plan ID, Food Name, Price, and Category are required.',
    });
  }

  try {
    let image_url = null;

    // Safely attempt image upload if file is present
    if (req.file) {
      try {
        image_url = await uploadToCloudinary(req.file.buffer);
      } catch (uploadErr) {
        console.error('Cloudinary Upload Warning:', uploadErr);
        // Fallback placeholder image if Cloudinary fails
        image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300';
      }
    }

    // Insert into FOOD_ITEM table
    const result = await db.query(
      `INSERT INTO FOOD_ITEM (meal_plan_id, provider_id, food_name, price, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        parseInt(meal_plan_id),
        parseInt(provider_id),
        food_name,
        parseFloat(price),
        category,
        image_url,
      ]
    );

    res.status(201).json({
      status: 'success',
      data: { food_item: result.rows[0] },
    });
  } catch (err) {
    console.error('Add Food Item Database Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add food item to database. ' + err.message,
    });
  }
};

// 3. Get All Meal Plans (With Spatial Distance Calculation within 5km Radius)
exports.getAllMealPlans = async (req, res) => {
  const { university_id } = req.query;

  try {
    let query = `
      SELECT mp.*, p.business_name, p.first_name, p.last_name, u.name AS university_name
    `;
    const params = [];

    if (university_id) {
      params.push(university_id);
      query += `,
        (6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(u.latitude)) * cos(radians(mp.latitude)) * cos(radians(mp.longitude) - radians(u.longitude)) + 
            sin(radians(u.latitude)) * sin(radians(mp.latitude))
          ))
        )) AS distance_km
        FROM MEAL_PLAN mp
        JOIN MEAL_PROVIDER p ON mp.provider_id = p.provider_id
        LEFT JOIN UNIVERSITY u ON mp.university_id = u.university_id
        WHERE mp.university_id = $1
          AND (6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians(u.latitude)) * cos(radians(mp.latitude)) * cos(radians(mp.longitude) - radians(u.longitude)) + 
              sin(radians(u.latitude)) * sin(radians(mp.latitude))
            ))
          )) <= 5.0
        ORDER BY distance_km ASC
      `;
    } else {
      query += `
        FROM MEAL_PLAN mp
        JOIN MEAL_PROVIDER p ON mp.provider_id = p.provider_id
        LEFT JOIN UNIVERSITY u ON mp.university_id = u.university_id
        ORDER BY mp.created_at DESC
      `;
    }

    const result = await db.query(query, params);
    res.status(200).json({ status: 'success', results: result.rows.length, data: { meal_plans: result.rows } });
  } catch (err) {
    console.error('Get Meal Plans Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve meal plans.' });
  }
};


// 4. Get Single Meal Plan Details with Categorized Food Choices and Reviews
exports.getMealPlanById = async (req, res) => {
  const { id } = req.params;

  try {
    const planResult = await db.query(
      `SELECT mp.*, p.business_name, p.phone_number AS provider_phone, u.name AS university_name
       FROM MEAL_PLAN mp
       JOIN MEAL_PROVIDER p ON mp.provider_id = p.provider_id
       LEFT JOIN UNIVERSITY u ON mp.university_id = u.university_id
       WHERE mp.meal_plan_id = $1`,
      [id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Meal plan not found.' });
    }

    const foodsResult = await db.query(
      `SELECT * FROM FOOD_ITEM WHERE meal_plan_id = $1 ORDER BY food_id ASC`,
      [id]
    );

    const reviewsResult = await db.query(
      `SELECT mr.*, s.first_name, s.last_name
       FROM MEAL_REVIEW mr
       JOIN STUDENT s ON mr.student_id = s.student_id
       WHERE mr.meal_plan_id = $1
       ORDER BY mr.created_at DESC`,
      [id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        meal_plan: planResult.rows[0],
        food_items: foodsResult.rows,
        reviews: reviewsResult.rows,
      },
    });
  } catch (err) {
    console.error('Get Meal Plan Details Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

// 5. Get Provider's Own Meal Plans with Food Items
exports.getMyMealPlans = async (req, res) => {
  const provider_id = req.user.id;

  try {
    const query = `
      SELECT mp.*,
        COALESCE(
          (SELECT json_agg(fi ORDER BY fi.food_id ASC)
           FROM FOOD_ITEM fi
           WHERE fi.meal_plan_id = mp.meal_plan_id
          ), '[]'::json
        ) AS food_items
      FROM MEAL_PLAN mp
      WHERE mp.provider_id = $1
      ORDER BY mp.created_at DESC;
    `;

    const result = await db.query(query, [provider_id]);
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: { meal_plans: result.rows }
    });
  } catch (err) {
    console.error('Get My Meal Plans Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch your meal plans.' });
  }
};

// 6. Delete Meal Plan
exports.deleteMealPlan = async (req, res) => {
  const { id } = req.params;
  const provider_id = req.user.id;

  try {
    const result = await db.query(
      'DELETE FROM MEAL_PLAN WHERE meal_plan_id = $1 AND provider_id = $2 RETURNING *',
      [id, provider_id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ status: 'fail', message: 'Meal plan not found or unauthorized.' });
    }

    res.status(200).json({ status: 'success', message: 'Meal plan deleted successfully.' });
  } catch (err) {
    console.error('Delete Meal Plan Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete meal plan.' });
  }
};

// 6b. Delete Single Food Item
exports.deleteFoodItem = async (req, res) => {
  const { foodId } = req.params;
  const provider_id = req.user.id;

  try {
    const result = await db.query(
      `DELETE FROM FOOD_ITEM 
       WHERE food_id = $1 
         AND (provider_id = $2 OR meal_plan_id IN (SELECT meal_plan_id FROM MEAL_PLAN WHERE provider_id = $2))
       RETURNING *`,
      [foodId, provider_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Food item not found or unauthorized.' });
    }

    res.status(200).json({ status: 'success', message: 'Food item deleted successfully.' });
  } catch (err) {
    console.error('Delete Food Item Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete food item.' });
  }
};

// 7. Post / Update Review for Meal Plan
exports.addMealReview = async (req, res) => {
  const student_id = req.user.id;
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const existing = await db.query(
      'SELECT review_id FROM MEAL_REVIEW WHERE student_id = $1 AND meal_plan_id = $2',
      [student_id, id]
    );

    if (existing.rows.length > 0) {
      const updated = await db.query(
        `UPDATE MEAL_REVIEW 
         SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP 
         WHERE review_id = $3 
         RETURNING *`,
        [rating, comment, existing.rows[0].review_id]
      );
      return res.status(200).json({ status: 'success', data: { review: updated.rows[0] } });
    }

    const result = await db.query(
      `INSERT INTO MEAL_REVIEW (student_id, meal_plan_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [student_id, id, rating, comment]
    );

    res.status(201).json({ status: 'success', data: { review: result.rows[0] } });
  } catch (err) {
    console.error('Add Meal Review Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to post review.' });
  }
};
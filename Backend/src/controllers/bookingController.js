const db = require('../db');

// 1. Student Requests Accommodation Booking
exports.createBooking = async (req, res) => {
  const student_id = req.user.id;
  const { accommodation_id, check_in_date, check_out_date } = req.body;

  try {
    // Check if property exists and is available
    const acc = await db.query('SELECT availability_status FROM ACCOMMODATION WHERE accommodation_id = $1', [accommodation_id]);
    if (acc.rows.length === 0 || !acc.rows[0].availability_status) {
      return res.status(400).json({ status: 'fail', message: 'Accommodation is currently unavailable for booking.' });
    }

    // Check if student already has an active or pending booking for this property
    const existing = await db.query(
      `SELECT * FROM BOOKING 
       WHERE student_id = $1 AND accommodation_id = $2 AND status IN ('pending', 'approved')`,
      [student_id, accommodation_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'fail', message: 'You already have an active or pending booking request for this property.' });
    }

    const result = await db.query(
      `INSERT INTO BOOKING (student_id, accommodation_id, check_in_date, check_out_date, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [student_id, accommodation_id, check_in_date, check_out_date]
    );

    res.status(201).json({ status: 'success', data: { booking: result.rows[0] } });
  } catch (err) {
    console.error('Create Booking Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to place booking request' });
  }
};

// 2. Get Bookings for Logged-In Student
exports.getStudentBookings = async (req, res) => {
  const student_id = req.user.id;

  try {
    const result = await db.query(
      `SELECT b.*, a.title, a.street, a.city, a.district, a.price_per_month, a.image_url,
              po.first_name AS owner_first_name, po.last_name AS owner_last_name, po.phone_number AS owner_phone
       FROM BOOKING b
       JOIN ACCOMMODATION a ON b.accommodation_id = a.accommodation_id
       JOIN PROPERTY_OWNER po ON a.owner_id = po.owner_id
       WHERE b.student_id = $1
       ORDER BY b.booking_date DESC`,
      [student_id]
    );

    res.status(200).json({ status: 'success', results: result.rows.length, data: { bookings: result.rows } });
  } catch (err) {
    console.error('Get Student Bookings Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch student bookings' });
  }
};

// 3. Get Bookings Received for Property Owner
exports.getOwnerBookings = async (req, res) => {
  const owner_id = req.user.id;

  try {
    const result = await db.query(
      `SELECT b.*, a.title AS accommodation_title,
              s.first_name AS student_first_name, s.last_name AS student_last_name, 
              s.email AS student_email, s.phone_number AS student_phone, s.university_name
       FROM BOOKING b
       JOIN ACCOMMODATION a ON b.accommodation_id = a.accommodation_id
       JOIN STUDENT s ON b.student_id = s.student_id
       WHERE a.owner_id = $1
       ORDER BY b.booking_date DESC`,
      [owner_id]
    );

    res.status(200).json({ status: 'success', results: result.rows.length, data: { bookings: result.rows } });
  } catch (err) {
    console.error('Get Owner Bookings Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch received bookings' });
  }
};

// 4. Update Booking Status (Property Owner Approves/Rejects)
exports.updateBookingStatus = async (req, res) => {
  const owner_id = req.user.id;
  const { booking_id } = req.params;
  const { status } = req.body; // 'approved' | 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ status: 'fail', message: 'Status must be approved or rejected' });
  }

  try {
    // Verify booking belongs to property owned by this owner
    const check = await db.query(
      `SELECT b.*, a.accommodation_id 
       FROM BOOKING b
       JOIN ACCOMMODATION a ON b.accommodation_id = a.accommodation_id
       WHERE b.booking_id = $1 AND a.owner_id = $2`,
      [booking_id, owner_id]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ status: 'fail', message: 'Booking not found or unauthorized' });
    }

    const booking = check.rows[0];

    // Update booking status
    const result = await db.query(
      'UPDATE BOOKING SET status = $1 WHERE booking_id = $2 RETURNING *',
      [status, booking_id]
    );

    // If approved, set accommodation availability to false
    if (status === 'approved') {
      await db.query('UPDATE ACCOMMODATION SET availability_status = false WHERE accommodation_id = $1', [booking.accommodation_id]);
    }

    res.status(200).json({ status: 'success', data: { booking: result.rows[0] } });
  } catch (err) {
    console.error('Update Booking Status Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update booking status' });
  }
};

// 5. Student Cancels Booking
exports.cancelBooking = async (req, res) => {
  const student_id = req.user.id;
  const { booking_id } = req.params;

  try {
    const check = await db.query('SELECT * FROM BOOKING WHERE booking_id = $1 AND student_id = $2', [booking_id, student_id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Booking not found' });
    }

    const booking = check.rows[0];

    const result = await db.query(
      "UPDATE BOOKING SET status = 'cancelled' WHERE booking_id = $1 RETURNING *",
      [booking_id]
    );

    // If it was previously approved, mark accommodation available again
    if (booking.status === 'approved') {
      await db.query('UPDATE ACCOMMODATION SET availability_status = true WHERE accommodation_id = $1', [booking.accommodation_id]);
    }

    res.status(200).json({ status: 'success', data: { booking: result.rows[0] } });
  } catch (err) {
    console.error('Cancel Booking Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to cancel booking' });
  }
};
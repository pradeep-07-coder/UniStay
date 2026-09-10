const db = require('../db');
const { generateMealId } = require('../utils/mealIdGenerator');

// 1. Student Subscribes to Meal Plan
exports.subscribeToPlan = async (req, res) => {
  const student_id = req.user.id;
  const { meal_plan_id, duration_days = 30 } = req.body;

  try {
    // Check if meal plan exists
    const planCheck = await db.query('SELECT * FROM MEAL_PLAN WHERE meal_plan_id = $1', [meal_plan_id]);
    if (planCheck.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Meal plan not found.' });
    }
    // Check if student already has an active subscription for this plan
    const activeSub = await db.query(
      `SELECT * FROM SUBSCRIPTION 
       WHERE student_id = $1 AND meal_plan_id = $2 AND status = 'active' AND expiry_date >= CURRENT_DATE`,
      [student_id, meal_plan_id]
    );
    if (activeSub.rows.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'You already have an active subscription for this meal plan.'
      });
    }
    // Generate unique Digital Meal ID & Expiry Date
    const mealIdCard = generateMealId();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(duration_days));

    const result = await db.query(
      `INSERT INTO SUBSCRIPTION (student_id, meal_plan_id, expiry_date, Meal_Id, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [student_id, meal_plan_id, expiryDate, mealIdCard]
    );

    res.status(201).json({
      status: 'success',
      data: { subscription: result.rows[0] }
    });
  } catch (err) {
    console.error('Subscribe Error:', err);
    res.status(500).json({ status: 'error', message: 'Subscription creation failed.' });
  }
};

// 2. Get Logged-In Student's Subscriptions & Digital ID Cards
exports.getStudentSubscriptions = async (req, res) => {
  const student_id = req.user.id;

  try {
    const query = `
      SELECT s.subscription_id, s.subscription_date, s.expiry_date, s.Meal_Id AS meal_card_id, s.status,
             mp.plan_name, mp.price, p.business_name, p.phone_number AS provider_phone,
             ARRAY_AGG(mt.meal_type) AS allowed_meals
      FROM SUBSCRIPTION s
      JOIN MEAL_PLAN mp ON s.meal_plan_id = mp.meal_plan_id
      JOIN MEAL_PROVIDER p ON mp.provider_id = p.provider_id
      LEFT JOIN MEAL_TYPE mt ON mp.meal_plan_id = mt.meal_plan_id
      WHERE s.student_id = $1
      GROUP BY s.subscription_id, mp.plan_name, mp.price, p.business_name, p.phone_number
      ORDER BY s.subscription_date DESC;
    `;

    const result = await db.query(query, [student_id]);
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: { subscriptions: result.rows }
    });
  } catch (err) {
    console.error('Get Student Subscriptions Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve subscriptions.' });
  }
};

// 3. Provider Views Active Subscribers
exports.getProviderSubscribers = async (req, res) => {
  const provider_id = req.user.id;

  try {
    const query = `
      SELECT s.subscription_id, s.Meal_Id AS meal_card_id, s.subscription_date, s.expiry_date, s.status,
             st.first_name AS student_first_name, st.last_name AS student_last_name,
             st.email AS student_email, st.phone_number AS student_phone, st.university_name,
             mp.plan_name
      FROM SUBSCRIPTION s
      JOIN MEAL_PLAN mp ON s.meal_plan_id = mp.meal_plan_id
      JOIN STUDENT st ON s.student_id = st.student_id
      WHERE mp.provider_id = $1
      ORDER BY s.subscription_date DESC;
    `;

    const result = await db.query(query, [provider_id]);
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: { subscribers: result.rows }
    });
  } catch (err) {
    console.error('Get Provider Subscribers Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch subscriber list.' });
  }
};

// 4. Cancel Subscription
exports.cancelSubscription = async (req, res) => {
  const student_id = req.user.id;
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE SUBSCRIPTION 
       SET status = 'cancelled' 
       WHERE subscription_id = $1 AND student_id = $2 
       RETURNING *`,
      [id, student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Subscription not found.' });
    }

    res.status(200).json({ status: 'success', data: { subscription: result.rows[0] } });
  } catch (err) {
    console.error('Cancel Subscription Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to cancel subscription.' });
  }
};

// Fetch Purchased Food Vouchers for the Logged-In Student
exports.getStudentVouchers = async (req, res) => {
  const student_id = req.user.id;

  try {
    const result = await db.query(
      `SELECT * FROM FOOD_VOUCHER 
       WHERE student_id = $1 
       ORDER BY created_at DESC`,
      [student_id]
    );

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: { vouchers: result.rows },
    });
  } catch (err) {
    console.error('Get Student Vouchers Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve food vouchers.',
    });
  }
};
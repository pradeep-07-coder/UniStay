const db = require('../db');

// Meal Scanner Engine (Meal Provider Scans/Inputs Student Meal ID)
exports.scanAndLogMeal = async (req, res) => {
  const provider_id = req.user.id;
  const { meal_card_id, meal_type } = req.body; 
  // meal_type expected: 'breakfast', 'lunch', or 'dinner'

  if (!meal_card_id || !meal_type) {
    return res.status(400).json({
      status: 'fail',
      message: 'Both Meal Card ID and meal type (breakfast/lunch/dinner) are required.'
    });
  }

  const normalizedMealType = meal_type.toLowerCase();

  try {
    // 1. Look up Subscription and Plan by Meal Card ID
    const subQuery = `
      SELECT s.subscription_id, s.expiry_date, s.status, s.meal_plan_id,
             st.first_name, st.last_name, st.university_name, st.student_id_number,
             mp.provider_id, mp.plan_name
      FROM SUBSCRIPTION s
      JOIN STUDENT st ON s.student_id = st.student_id
      JOIN MEAL_PLAN mp ON s.meal_plan_id = mp.meal_plan_id
      WHERE s.Meal_Id = $1;
    `;

    const subResult = await db.query(subQuery, [meal_card_id]);

    if (subResult.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid Meal ID Card. No subscription found.'
      });
    }

    const sub = subResult.rows[0];

    // 2. Check if Provider owns this meal plan
    if (sub.provider_id !== provider_id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. This Digital Meal ID belongs to a different meal provider.'
      });
    }

    // 3. Verify Subscription Status
    if (sub.status !== 'active') {
      return res.status(400).json({
        status: 'fail',
        message: `Subscription is currently '${sub.status}'. Meal request rejected.`
      });
    }

    // 4. Verify Expiry Date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(sub.expiry_date);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) {
      // Auto-expire subscription
      await db.query("UPDATE SUBSCRIPTION SET status = 'expired' WHERE subscription_id = $1", [sub.subscription_id]);
      return res.status(400).json({
        status: 'fail',
        message: 'Subscription has expired. Meal request rejected.'
      });
    }

    // 5. Verify Meal Type is Covered by Plan
    const typeCheck = await db.query(
      'SELECT * FROM MEAL_TYPE WHERE meal_plan_id = $1 AND meal_type = $2',
      [sub.meal_plan_id, normalizedMealType]
    );

    if (typeCheck.rows.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: `Meal plan '${sub.plan_name}' does not include '${normalizedMealType}'.`
      });
    }

    // 6. Check Duplicate Consumption Today
    const duplicateCheck = await db.query(
      `SELECT * FROM MEAL_CONSUMPTION_RECORD 
       WHERE subscription_id = $1 
         AND meal_type_consumed = $2 
         AND DATE(consumption_date) = CURRENT_DATE`,
      [sub.subscription_id, normalizedMealType]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: `ALREADY REDEEMED: Student has already redeemed '${normalizedMealType}' today (${new Date().toLocaleDateString()}).`
      });
    }

    // 7. Log Consumption Record
    const recordResult = await db.query(
      `INSERT INTO MEAL_CONSUMPTION_RECORD (subscription_id, provider_id, meal_type_consumed)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [sub.subscription_id, provider_id, normalizedMealType]
    );

    res.status(200).json({
      status: 'success',
      message: `✅ Meal Approved: ${normalizedMealType.toUpperCase()} served to ${sub.first_name} ${sub.last_name}`,
      data: {
        record: recordResult.rows[0],
        student: {
          name: `${sub.first_name} ${sub.last_name}`,
          university: sub.university_name,
          student_id_number: sub.student_id_number,
          plan_name: sub.plan_name
        }
      }
    });

  } catch (err) {
    console.error('Meal Scan Error:', err);
    res.status(500).json({ status: 'error', message: 'Meal scanning service error.' });
  }
};

// View Consumption Logs
exports.getConsumptionLogs = async (req, res) => {
  const { id, role } = req.user;

  try {
    let query, params;
    if (role === 'meal_provider') {
      query = `
        SELECT mcr.*, st.first_name, st.last_name, mp.plan_name, s.Meal_Id
        FROM MEAL_CONSUMPTION_RECORD mcr
        JOIN SUBSCRIPTION s ON mcr.subscription_id = s.subscription_id
        JOIN STUDENT st ON s.student_id = st.student_id
        JOIN MEAL_PLAN mp ON s.meal_plan_id = mp.meal_plan_id
        WHERE mcr.provider_id = $1
        ORDER BY mcr.consumption_date DESC;
      `;
      params = [id];
    } else {
      // Student view
      query = `
        SELECT mcr.*, mp.plan_name, p.business_name
        FROM MEAL_CONSUMPTION_RECORD mcr
        JOIN SUBSCRIPTION s ON mcr.subscription_id = s.subscription_id
        JOIN MEAL_PLAN mp ON s.meal_plan_id = mp.meal_plan_id
        JOIN MEAL_PROVIDER p ON mcr.provider_id = p.provider_id
        WHERE s.student_id = $1
        ORDER BY mcr.consumption_date DESC;
      `;
      params = [id];
    }

    const result = await db.query(query, params);
    res.status(200).json({ status: 'success', results: result.rows.length, data: { logs: result.rows } });
  } catch (err) {
    console.error('Get Logs Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch logs.' });
  }
};
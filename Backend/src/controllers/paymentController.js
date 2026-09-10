const db = require('../db');
const { generateMealId } = require('../utils/mealIdGenerator');

exports.processDemoPayment = async (req, res) => {
  const user_id = req.user.id;
  const role = req.user.role;
  const { payment_type, reference_id, amount, payment_details } = req.body;

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // 1. Record Payment Transaction
    const payResult = await client.query(
      `INSERT INTO PAYMENT (user_id, user_role, payment_type, reference_id, amount, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, role, payment_type, reference_id, amount, payment_details?.card_type || 'Demo Card']
    );

    // 2. Perform Specific Entity Booking/Subscription Updates
    if (payment_type === 'accommodation_rent') {
      // Check availability with row lock to prevent race conditions / double booking
      const accCheck = await client.query(
        'SELECT availability_status, owner_id, title FROM ACCOMMODATION WHERE accommodation_id = $1 FOR UPDATE',
        [reference_id]
      );
      if (accCheck.rows.length === 0 || !accCheck.rows[0].availability_status) {
        await client.query('ROLLBACK');
        return res.status(400).json({ status: 'fail', message: 'Accommodation is no longer available for renting.' });
      }

      const checkIn = new Date();
      const checkOut = new Date();
      checkOut.setMonth(checkOut.getMonth() + 1); // 1 Month Valid Rent

      await client.query(
        `INSERT INTO BOOKING (student_id, accommodation_id, check_in_date, check_out_date, status)
         VALUES ($1, $2, $3, $4, 'approved')`,
        [user_id, reference_id, checkIn, checkOut]
      );

      await client.query(
        'UPDATE ACCOMMODATION SET availability_status = false WHERE accommodation_id = $1',
        [reference_id]
      );

      // Notify Property Owner
      await client.query(
        `INSERT INTO notifications (user_id, user_role, title, message)
         VALUES ($1, 'property_owner', 'New Rent Paid & Booking Approved', $2)`,
        [
          accCheck.rows[0].owner_id,
          `A student has paid rent for your listing "${accCheck.rows[0].title}". Booking has been confirmed!`
        ]
      );
    } else if (payment_type === 'meal_subscription') {
      const mealIdCard = generateMealId();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      await client.query(
        `INSERT INTO SUBSCRIPTION (student_id, meal_plan_id, expiry_date, Meal_Id, status)
         VALUES ($1, $2, $3, $4, 'active')`,
        [user_id, reference_id, expiryDate, mealIdCard]
      );

      // Notify Student
      await client.query(
        `INSERT INTO notifications (user_id, user_role, title, message)
         VALUES ($1, 'student', 'Meal Plan Subscription Active', $2)`,
        [
          user_id,
          `Your Digital Meal ID pass (${mealIdCard}) is active for 30 days!`
        ]
      );
    } else if (payment_type === 'food_voucher') {
      const voucherCode = 'VOUCHER-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const tierName = payment_details?.tier_name || 'Standard';
      
      await client.query(
        `INSERT INTO FOOD_VOUCHER (voucher_code, student_id, tier_name, initial_balance, remaining_balance, status)
        VALUES ($1, $2, $3, $4, $4, 'active')`,
        [
          voucherCode, 
          user_id,
          tierName, 
          amount
        ]
      );

      // Notify Student
      await client.query(
        `INSERT INTO notifications (user_id, user_role, title, message)
         VALUES ($1, 'student', 'Food Voucher Activated', $2)`,
        [
          user_id,
          `Your ${tierName} Food Voucher (${voucherCode}) with balance LKR ${parseFloat(amount).toLocaleString()} is ready to use!`
        ]
      );
    }
    
    await client.query('COMMIT');

    res.status(200).json({
      status: 'success',
      message: 'Demo Payment Processed Successfully!',
      data: { payment: payResult.rows[0] },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Payment Processing Error:', err);
    res.status(500).json({ status: 'error', message: 'Payment transaction failed' });
  } finally {
    client.release();
  }
};
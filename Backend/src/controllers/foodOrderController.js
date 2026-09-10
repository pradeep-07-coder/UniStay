const db = require('../db');

// 1. Place Food Order
exports.placeOrder = async (req, res) => {
  const student_id = req.user.id;
  const { meal_plan_id, provider_id, selected_foods, total_amount } = req.body;

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO FOOD_ORDER (student_id, meal_plan_id, provider_id, total_amount, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [student_id, meal_plan_id, provider_id, total_amount]
    );

    const order = orderResult.rows[0];

    for (const item of selected_foods) {
      await client.query(
        `INSERT INTO ORDER_ITEM (order_id, food_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.order_id, item.food_id, 1, item.price]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({ status: 'success', data: { order } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Place Order Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to place order.' });
  } finally {
    client.release();
  }
};

// 2. Meal Provider Updates Order Status to "Ready To Pick up"
exports.updateOrderStatus = async (req, res) => {
  const provider_id = req.user.id;
  const { order_id } = req.params;
  const { status } = req.body; // 'Ready To Pick up'

  try {
    const result = await db.query(
      `UPDATE FOOD_ORDER SET status = $1 
       WHERE order_id = $2 AND provider_id = $3 RETURNING *`,
      [status, order_id, provider_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Order not found.' });
    }

    res.status(200).json({ status: 'success', data: { order: result.rows[0] } });
  } catch (err) {
    console.error('Update Order Status Error:', err);
    res.status(500).json({ status: 'error', message: 'Status update failed.' });
  }
};

// 3. Provider Confirms Order Collection using Student's Food Voucher Code
exports.confirmOrderCollection = async (req, res) => {
  const provider_id = req.user.id;
  const { order_id } = req.params;
  const { voucher_code } = req.body;

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Fetch Order with row locking
    const orderRes = await client.query(
      `SELECT * FROM FOOD_ORDER WHERE order_id = $1 AND provider_id = $2 FOR UPDATE`,
      [order_id, provider_id]
    );

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'fail', message: 'Order record not found.' });
    }

    const order = orderRes.rows[0];

    // Prevent double spending / duplicate confirmation
    if (order.status === 'Confirmed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'fail', message: 'Order has already been confirmed and paid.' });
    }

    // Fetch Voucher with row locking
    const voucherRes = await client.query(
      `SELECT * FROM FOOD_VOUCHER WHERE voucher_code = $1 AND student_id = $2 AND status = 'active'`,
      [voucher_code, order.student_id]
    );

    if (voucherRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'fail', message: 'Invalid or expired voucher code.' });
    }

    const voucher = voucherRes.rows[0];

    if (parseFloat(voucher.remaining_balance) < parseFloat(order.total_amount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        status: 'fail', 
        message: `Insufficient voucher balance! Available: LKR ${voucher.remaining_balance}` 
      });
    }

    // Deduct Balance from Voucher
    const newBalance = parseFloat(voucher.remaining_balance) - parseFloat(order.total_amount);
    const voucherStatus = newBalance === 0 ? 'expired' : 'active';

    await client.query(
      `UPDATE FOOD_VOUCHER SET remaining_balance = $1, status = $2 WHERE voucher_id = $3`,
      [newBalance, voucherStatus, voucher.voucher_id]
    );

    // Update Order Status to 'Confirmed'
    const updatedOrder = await client.query(
      `UPDATE FOOD_ORDER SET status = 'Confirmed', voucher_code_used = $1 WHERE order_id = $2 RETURNING *`,
      [voucher_code, order_id]
    );

    // Credit Amount to Meal Provider's Wallet
    await client.query(
      `INSERT INTO PROVIDER_WALLET (provider_id, balance) VALUES ($1, $2)
       ON CONFLICT (provider_id) DO UPDATE SET balance = PROVIDER_WALLET.balance + $2`,
      [provider_id, order.total_amount]
    );

    await client.query('COMMIT');

    res.status(200).json({
      status: 'success',
      message: 'Order Confirmed and Voucher Balance Deducted!',
      data: { order: updatedOrder.rows[0], remaining_voucher_balance: newBalance },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Confirm Order Error:', err);
    res.status(500).json({ status: 'error', message: 'Order confirmation failed.' });
  } finally {
    client.release();
  }
};

// 4. Get Student Orders (with Itemized Food Details)
exports.getStudentOrders = async (req, res) => {
  const student_id = req.user.id;
  try {
    const result = await db.query(
      `SELECT fo.*, mp.plan_name, p.business_name,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'order_item_id', oi.order_item_id,
                'food_id', oi.food_id,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'food_name', fi.food_name,
                'category', fi.category,
                'image_url', fi.image_url
              ) ORDER BY oi.order_item_id ASC
            )
            FROM ORDER_ITEM oi
            LEFT JOIN FOOD_ITEM fi ON oi.food_id = fi.food_id
            WHERE oi.order_id = fo.order_id
          ), '[]'::json
        ) AS items
       FROM FOOD_ORDER fo
       JOIN MEAL_PLAN mp ON fo.meal_plan_id = mp.meal_plan_id
       JOIN MEAL_PROVIDER p ON fo.provider_id = p.provider_id
       WHERE fo.student_id = $1 ORDER BY fo.order_date DESC`,
      [student_id]
    );
    res.status(200).json({ status: 'success', data: { orders: result.rows } });
  } catch (err) {
    console.error('Fetch Student Orders Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch student orders.' });
  }
};

// 5. Get Provider Orders (with Itemized Food Details)
exports.getProviderOrders = async (req, res) => {
  const provider_id = req.user.id;
  try {
    const result = await db.query(
      `SELECT fo.*, s.first_name, s.last_name, s.phone_number, mp.plan_name,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'order_item_id', oi.order_item_id,
                'food_id', oi.food_id,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'food_name', fi.food_name,
                'category', fi.category,
                'image_url', fi.image_url
              ) ORDER BY oi.order_item_id ASC
            )
            FROM ORDER_ITEM oi
            LEFT JOIN FOOD_ITEM fi ON oi.food_id = fi.food_id
            WHERE oi.order_id = fo.order_id
          ), '[]'::json
        ) AS items
       FROM FOOD_ORDER fo
       JOIN STUDENT s ON fo.student_id = s.student_id
       JOIN MEAL_PLAN mp ON fo.meal_plan_id = mp.meal_plan_id
       WHERE fo.provider_id = $1 ORDER BY fo.order_date DESC`,
      [provider_id]
    );
    res.status(200).json({ status: 'success', data: { orders: result.rows } });
  } catch (err) {
    console.error('Fetch Provider Orders Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch provider orders.' });
  }
};
const db = require('../db');

// Get Provider Wallet Balance
exports.getWalletBalance = async (req, res) => {
  const provider_id = req.user.id;
  try {
    const result = await db.query(
      `SELECT balance FROM PROVIDER_WALLET WHERE provider_id = $1`,
      [provider_id]
    );
    const balance = result.rows.length > 0 ? result.rows[0].balance : 0.00;
    res.status(200).json({ status: 'success', data: { balance } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch wallet balance.' });
  }
};

// Submit Withdrawal Request
exports.withdrawBalance = async (req, res) => {
  const provider_id = req.user.id;
  const { bank_name, account_holder_name, account_number, branch, amount, phone_number } = req.body;

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const walletRes = await client.query(
      `SELECT balance FROM PROVIDER_WALLET WHERE provider_id = $1`,
      [provider_id]
    );

    const currentBalance = walletRes.rows.length > 0 ? parseFloat(walletRes.rows[0].balance) : 0.00;

    if (currentBalance < parseFloat(amount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'fail', message: 'Insufficient wallet balance.' });
    }

    // Deduct Balance
    await client.query(
      `UPDATE PROVIDER_WALLET SET balance = balance - $1 WHERE provider_id = $2`,
      [amount, provider_id]
    );

    // Record Withdrawal
    const withdrawalRes = await client.query(
      `INSERT INTO WITHDRAWAL_REQUEST (provider_id, bank_name, account_holder_name, account_number, branch, amount, phone_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [provider_id, bank_name, account_holder_name, account_number, branch, amount, phone_number]
    );

    await client.query('COMMIT');

    res.status(200).json({
      status: 'success',
      message: 'Withdrawal request processed successfully!',
      data: { withdrawal: withdrawalRes.rows[0] },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Withdrawal Error:', err);
    res.status(500).json({ status: 'error', message: 'Withdrawal failed.' });
  } finally {
    client.release();
  }
};
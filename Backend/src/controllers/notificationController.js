const db = require('../db');

// 1. Get Logged-In User's Notifications
exports.getMyNotifications = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 AND user_role = $2 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId, userRole]
    );

    res.status(200).json({
      status: 'success',
      data: { notifications: result.rows },
    });
  } catch (err) {
    console.error('Fetch Notifications Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch notifications.' });
  }
};

// 2. Mark Single Notification as Read
exports.markAsRead = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE notification_id = $1 AND user_id = $2 
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Notification not found.' });
    }

    res.status(200).json({
      status: 'success',
      data: { notification: result.rows[0] },
    });
  } catch (err) {
    console.error('Mark Notification Read Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update notification.' });
  }
};

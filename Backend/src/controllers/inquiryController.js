const db = require('../db');

// Submit new contact inquiry
exports.createInquiry = async (req, res) => {
  const { name, email, subject, message } = req.body;
  const userId = req.user ? req.user.id : null;
  const userRole = req.user ? req.user.role : 'guest';

  if (!name || !email || !message) {
    return res.status(400).json({ status: 'fail', message: 'Name, email, and message are required.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO inquiries (user_id, user_role, full_name, email, subject, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, userRole, name, email, subject || 'General Inquiry', message]
    );

    res.status(201).json({
      status: 'success',
      message: 'Inquiry submitted successfully.',
      data: { inquiry: result.rows[0] },
    });
  } catch (err) {
    console.error('Create Inquiry Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to submit inquiry.' });
  }
};

// Admin: Get all inquiries
exports.getAllInquiries = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: { inquiries: result.rows },
    });
  } catch (err) {
    console.error('Get All Inquiries Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch inquiries.' });
  }
};

// Admin: Respond to inquiry and notify user
exports.respondToInquiry = async (req, res) => {
  const { id } = req.params;
  const { admin_response } = req.body;

  if (!admin_response || !admin_response.trim()) {
    return res.status(400).json({ status: 'fail', message: 'Admin response text is required.' });
  }

  try {
    const updateResult = await db.query(
      `UPDATE inquiries 
       SET admin_response = $1, status = 'responded', updated_at = CURRENT_TIMESTAMP
       WHERE inquiry_id = $2
       RETURNING *`,
      [admin_response.trim(), id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Inquiry not found.' });
    }

    const inquiry = updateResult.rows[0];

    // Determine target user to dispatch notification
    let targetUserId = inquiry.user_id;
    let targetUserRole = inquiry.user_role;

    if (!targetUserId && inquiry.email) {
      const normalizedEmail = inquiry.email.toLowerCase().trim();
      const studentMatch = await db.query('SELECT student_id FROM STUDENT WHERE email = $1', [normalizedEmail]);
      if (studentMatch.rows.length > 0) {
        targetUserId = studentMatch.rows[0].student_id;
        targetUserRole = 'student';
      } else {
        const ownerMatch = await db.query('SELECT owner_id FROM PROPERTY_OWNER WHERE email = $1', [normalizedEmail]);
        if (ownerMatch.rows.length > 0) {
          targetUserId = ownerMatch.rows[0].owner_id;
          targetUserRole = 'property_owner';
        } else {
          const providerMatch = await db.query('SELECT provider_id FROM MEAL_PROVIDER WHERE email = $1', [normalizedEmail]);
          if (providerMatch.rows.length > 0) {
            targetUserId = providerMatch.rows[0].provider_id;
            targetUserRole = 'meal_provider';
          }
        }
      }
    }

    // If target user identified, generate a notification
    if (targetUserId && targetUserRole && targetUserRole !== 'guest') {
      await db.query(
        `INSERT INTO notifications (user_id, user_role, title, message)
         VALUES ($1, $2, $3, $4)`,
        [
          targetUserId,
          targetUserRole,
          `Inquiry Response: ${inquiry.subject}`,
          `Admin responded: "${admin_response.trim()}"`
        ]
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Inquiry response recorded and user notified.',
      data: { inquiry },
    });
  } catch (err) {
    console.error('Respond To Inquiry Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to record response.' });
  }
};


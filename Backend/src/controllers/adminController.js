const db = require('../db');

// ==========================================
// 1. ACCOUNT VERIFICATION WORKFLOWS
// ==========================================

// Get pending verification requests for Property Owners and Meal Providers
exports.getPendingVerifications = async (req, res) => {
  try {
    const ownersQuery = `
      SELECT owner_id AS id, first_name, last_name, email, phone_number, 
             street, city, verification_status, registration_date, 'property_owner' AS role
      FROM PROPERTY_OWNER
      WHERE verification_status = 'pending'
      ORDER BY registration_date ASC;
    `;

    const providersQuery = `
      SELECT provider_id AS id, first_name, last_name, email, phone_number, 
             business_name, street, city, verification_status, registration_date, 'meal_provider' AS role
      FROM MEAL_PROVIDER
      WHERE verification_status = 'pending'
      ORDER BY registration_date ASC;
    `;

    const [owners, providers] = await Promise.all([
      db.query(ownersQuery),
      db.query(providersQuery),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        pending_property_owners: owners.rows,
        pending_meal_providers: providers.rows,
        total_pending: owners.rows.length + providers.rows.length,
      },
    });
  } catch (err) {
    console.error('Get Pending Verifications Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve pending verifications.' });
  }
};

// Approve or Reject Property Owner or Meal Provider
exports.verifyUserAccount = async (req, res) => {
  const { user_type, id } = req.params; // user_type: 'owner' or 'provider'
  const { status } = req.body; // status: 'verified' or 'rejected'

  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ status: 'fail', message: "Status must be either 'verified' or 'rejected'." });
  }

  try {
    let query, result;

    if (user_type === 'owner') {
      query = `
        UPDATE PROPERTY_OWNER 
        SET verification_status = $1, verified_date = CURRENT_TIMESTAMP
        WHERE owner_id = $2
        RETURNING owner_id, first_name, last_name, email, verification_status;
      `;
      result = await db.query(query, [status, id]);
    } else if (user_type === 'provider') {
      query = `
        UPDATE MEAL_PROVIDER 
        SET verification_status = $1
        WHERE provider_id = $2
        RETURNING provider_id, business_name, email, verification_status;
      `;
      result = await db.query(query, [status, id]);
    } else {
      return res.status(400).json({ status: 'fail', message: "Invalid user type. Use 'owner' or 'provider'." });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'User record not found.' });
    }

    res.status(200).json({
      status: 'success',
      message: `Account status updated to '${status}'.`,
      data: { user: result.rows[0] },
    });
  } catch (err) {
    console.error('Verify User Error:', err);
    res.status(500).json({ status: 'error', message: 'Account verification update failed.' });
  }
};

// ==========================================
// 2. USER MANAGEMENT & SUSPENSIONS
// ==========================================

// Get all users categorized by role
exports.getAllUsers = async (req, res) => {
  try {
    const students = await db.query(
      'SELECT student_id, first_name, last_name, email, university_name, is_active, registration_date FROM STUDENT ORDER BY registration_date DESC'
    );
    const owners = await db.query(
      'SELECT owner_id, first_name, last_name, email, verification_status, is_active, registration_date FROM PROPERTY_OWNER ORDER BY registration_date DESC'
    );
    const providers = await db.query(
      'SELECT provider_id, business_name, first_name, last_name, email, verification_status, is_active, registration_date FROM MEAL_PROVIDER ORDER BY registration_date DESC'
    );

    res.status(200).json({
      status: 'success',
      data: {
        students: students.rows,
        property_owners: owners.rows,
        meal_providers: providers.rows,
      },
    });
  } catch (err) {
    console.error('Get All Users Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve system users.' });
  }
};

// Toggle user active/suspend status
exports.toggleUserStatus = async (req, res) => {
  const { role, id } = req.params; // role: 'student', 'owner', 'provider'
  const { is_active } = req.body; // boolean

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ status: 'fail', message: "Field 'is_active' must be a boolean (true/false)." });
  }
  try {
    let table, idCol;
    if (role === 'student') { table = 'STUDENT'; idCol = 'student_id'; }
    else if (role === 'owner') { table = 'PROPERTY_OWNER'; idCol = 'owner_id'; }
    else if (role === 'provider') { table = 'MEAL_PROVIDER'; idCol = 'provider_id'; }
    else { return res.status(400).json({ status: 'fail', message: 'Invalid user role.' }); }

    const result = await db.query(
      `UPDATE ${table} SET is_active = $1 WHERE ${idCol} = $2 RETURNING *`,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    const updatedUser = result.rows[0];
    delete updatedUser.password_hash;

    res.status(200).json({
      status: 'success',
      message: `User status set to ${is_active ? 'active' : 'suspended'}.`,
      data: { user: updatedUser },
    });
  } catch (err) {
    console.error('Toggle User Status Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update user active state.' });
  }
};

// ==========================================
// 3. SYSTEM ANALYTICS & REPORTS
// ==========================================

// Get System Overview Metrics
exports.getSystemReports = async (req, res) => {
  try {
    const studentCount = await db.query('SELECT COUNT(*) FROM STUDENT');
    const ownerCount = await db.query('SELECT COUNT(*) FROM PROPERTY_OWNER');
    const providerCount = await db.query('SELECT COUNT(*) FROM MEAL_PROVIDER');
    const listingCount = await db.query('SELECT COUNT(*) FROM ACCOMMODATION');
    const activeBookingCount = await db.query("SELECT COUNT(*) FROM BOOKING WHERE status = 'approved'");
    const activeSubCount = await db.query("SELECT COUNT(*) FROM SUBSCRIPTION WHERE status = 'active'");
    const totalConsumptionCount = await db.query('SELECT COUNT(*) FROM MEAL_CONSUMPTION_RECORD');

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          total_students: parseInt(studentCount.rows[0].count),
          total_property_owners: parseInt(ownerCount.rows[0].count),
          total_meal_providers: parseInt(providerCount.rows[0].count),
          total_accommodations_listed: parseInt(listingCount.rows[0].count),
          total_active_bookings: parseInt(activeBookingCount.rows[0].count),
          total_active_meal_subscriptions: parseInt(activeSubCount.rows[0].count),
          total_meals_served: parseInt(totalConsumptionCount.rows[0].count),
        },
      },
    });
  } catch (err) {
    console.error('Get System Reports Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to generate system analytics.' });
  }
};


// Add New University (Admin Only)
exports.addUniversity = async (req, res) => {
  const { name, city, latitude, longitude } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO UNIVERSITY (name, city, latitude, longitude) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, city, latitude, longitude]
    );
    res.status(201).json({ status: 'success', data: { university: result.rows[0] } });
  } catch (err) {
    console.error('Add University Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to add university' });
  }
};

// Get All Universities for Dropdowns & Filters
exports.getAllUniversities = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM UNIVERSITY ORDER BY name ASC');
    res.status(200).json({ status: 'success', data: { universities: result.rows } });
  } catch (err) {
    console.error('Get Universities Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve universities' });
  }
};
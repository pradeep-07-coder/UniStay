const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken } = require('../utils/jwt');

// Helper to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// ==========================================
// 1. STUDENT AUTHENTICATION
// ==========================================
exports.registerStudent = async (req, res) => {
  const {
    first_name, last_name, email, password,
    phone_number, street, city, postal_code,
    university_name, student_id_number
  } = req.body;

  try {
    const existing = await db.query('SELECT student_id FROM STUDENT WHERE email = $1 OR student_id_number = $2', [email, student_id_number]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'fail', message: 'Email or Student ID Number already registered.' });
    }

    const password_hash = await hashPassword(password);
    const result = await db.query(
      `INSERT INTO STUDENT 
       (first_name, last_name, email, password_hash, phone_number, street, city, postal_code, university_name, student_id_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING student_id, first_name, last_name, email, university_name, student_id_number`,
      [first_name, last_name, email, password_hash, phone_number, street, city, postal_code, university_name, student_id_number]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.student_id, role: 'student', email: user.email });

    res.status(201).json({ status: 'success', token, data: { user: { ...user, role: 'student' } } });
  } catch (err) {
    console.error('Register Student Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM STUDENT WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    delete user.password_hash;
    const token = generateToken({ id: user.student_id, role: 'student', email: user.email });

    res.status(200).json({ status: 'success', token, data: { user: { ...user, role: 'student' } } });
  } catch (err) {
    console.error('Login Student Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ==========================================
// 2. PROPERTY OWNER AUTHENTICATION
// ==========================================
exports.registerPropertyOwner = async (req, res) => {
  const { first_name, last_name, email, password, phone_number, street, city, postal_code } = req.body;

  try {
    const existing = await db.query('SELECT owner_id FROM PROPERTY_OWNER WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'fail', message: 'Email already registered.' });
    }

    const password_hash = await hashPassword(password);
    const result = await db.query(
      `INSERT INTO PROPERTY_OWNER 
       (first_name, last_name, email, password_hash, phone_number, street, city, postal_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING owner_id, first_name, last_name, email, verification_status`,
      [first_name, last_name, email, password_hash, phone_number, street, city, postal_code]
    );

    const user = result.rows[0];
    const token = generateToken({ 
      id: user.owner_id, 
      role: 'property_owner', 
      email: user.email, 
      verificationStatus: user.verification_status 
    });

    res.status(201).json({ status: 'success', token, data: { user: { ...user, role: 'property_owner' } } });
  } catch (err) {
    console.error('Register Property Owner Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.loginPropertyOwner = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM PROPERTY_OWNER WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    delete user.password_hash;
    const token = generateToken({ 
      id: user.owner_id, 
      role: 'property_owner', 
      email: user.email, 
      verificationStatus: user.verification_status 
    });

    res.status(200).json({ status: 'success', token, data: { user: { ...user, role: 'property_owner' } } });
  } catch (err) {
    console.error('Login Property Owner Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ==========================================
// 3. MEAL PROVIDER AUTHENTICATION
// ==========================================
exports.registerMealProvider = async (req, res) => {
  const { first_name, last_name, email, password, phone_number, street, city, postal_code, business_name } = req.body;

  try {
    const existing = await db.query('SELECT provider_id FROM MEAL_PROVIDER WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'fail', message: 'Email already registered.' });
    }

    const password_hash = await hashPassword(password);
    const result = await db.query(
      `INSERT INTO MEAL_PROVIDER 
       (first_name, last_name, email, password_hash, phone_number, street, city, postal_code, business_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING provider_id, first_name, last_name, email, business_name, verification_status`,
      [first_name, last_name, email, password_hash, phone_number, street, city, postal_code, business_name]
    );

    const user = result.rows[0];
    const token = generateToken({ 
      id: user.provider_id, 
      role: 'meal_provider', 
      email: user.email, 
      verificationStatus: user.verification_status 
    });

    res.status(201).json({ status: 'success', token, data: { user: { ...user, role: 'meal_provider' } } });
  } catch (err) {
    console.error('Register Meal Provider Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.loginMealProvider = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM MEAL_PROVIDER WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    delete user.password_hash;
    const token = generateToken({ 
      id: user.provider_id, 
      role: 'meal_provider', 
      email: user.email, 
      verificationStatus: user.verification_status 
    });

    res.status(200).json({ status: 'success', token, data: { user: { ...user, role: 'meal_provider' } } });
  } catch (err) {
    console.error('Login Meal Provider Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ==========================================
// 4. ADMIN AUTHENTICATION & SEED
// ==========================================
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM ADMIN WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    delete user.password_hash;
    const token = generateToken({ id: user.admin_id, role: 'admin', email: user.email });

    res.status(200).json({ status: 'success', token, data: { user: { ...user, role: 'admin' } } });
  } catch (err) {
    console.error('Login Admin Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.registerAdmin = async (req, res) => {
  const { first_name, last_name, email, password, access_level } = req.body;

  try {
    const existing = await db.query('SELECT admin_id FROM ADMIN WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'fail', message: 'Admin email already registered.' });
    }

    const password_hash = await hashPassword(password);
    const result = await db.query(
      `INSERT INTO ADMIN (first_name, last_name, email, password_hash, access_level)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING admin_id, first_name, last_name, email, access_level`,
      [first_name, last_name, email, password_hash, access_level || 'superadmin']
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.admin_id, role: 'admin', email: user.email });

    res.status(201).json({ status: 'success', token, data: { user: { ...user, role: 'admin' } } });
  } catch (err) {
    console.error('Register Admin Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Get current profile
exports.getMe = async (req, res) => {
  const { id, role } = req.user;

  try {
    let table, idCol;
    if (role === 'student') { table = 'STUDENT'; idCol = 'student_id'; }
    else if (role === 'property_owner') { table = 'PROPERTY_OWNER'; idCol = 'owner_id'; }
    else if (role === 'meal_provider') { table = 'MEAL_PROVIDER'; idCol = 'provider_id'; }
    else if (role === 'admin') { table = 'ADMIN'; idCol = 'admin_id'; }

    const result = await db.query(`SELECT * FROM ${table} WHERE ${idCol} = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    const user = result.rows[0];
    delete user.password_hash;
    res.status(200).json({ status: 'success', data: { user: { ...user, role } } });
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
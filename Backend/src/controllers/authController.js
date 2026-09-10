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

  const normalizedEmail = (email || '').toLowerCase().trim();

  try {
    const existing = await db.query('SELECT student_id FROM STUDENT WHERE email = $1 OR student_id_number = $2', [normalizedEmail, student_id_number]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'fail', message: 'Email or Student ID Number already registered.' });
    }

    const password_hash = await hashPassword(password);
    const result = await db.query(
      `INSERT INTO STUDENT 
       (first_name, last_name, email, password_hash, phone_number, street, city, postal_code, university_name, student_id_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING student_id, first_name, last_name, email, university_name, student_id_number`,
      [first_name, last_name, normalizedEmail, password_hash, phone_number, street, city, postal_code, university_name, student_id_number]
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
  const normalizedEmail = (email || '').toLowerCase().trim();

  try {
    const result = await db.query('SELECT * FROM STUDENT WHERE email = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.is_active === false) {
      return res.status(403).json({ status: 'fail', message: 'Your student account has been suspended by an administrator.' });
    }

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
  const normalizedEmail = (email || '').toLowerCase().trim();

  try {
    const existing = await db.query('SELECT owner_id FROM PROPERTY_OWNER WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'fail', message: 'Email already registered.' });
    }

    const password_hash = await hashPassword(password);
    const result = await db.query(
      `INSERT INTO PROPERTY_OWNER 
       (first_name, last_name, email, password_hash, phone_number, street, city, postal_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING owner_id, first_name, last_name, email, verification_status`,
      [first_name, last_name, normalizedEmail, password_hash, phone_number, street, city, postal_code]
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
  const normalizedEmail = (email || '').toLowerCase().trim();

  try {
    const result = await db.query('SELECT * FROM PROPERTY_OWNER WHERE email = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.is_active === false) {
      return res.status(403).json({ status: 'fail', message: 'Your property owner account has been suspended by an administrator.' });
    }

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
  const normalizedEmail = (email || '').toLowerCase().trim();

  try {
    const existing = await db.query('SELECT provider_id FROM MEAL_PROVIDER WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'fail', message: 'Email already registered.' });
    }

    const password_hash = await hashPassword(password);
    const result = await db.query(
      `INSERT INTO MEAL_PROVIDER 
       (first_name, last_name, email, password_hash, phone_number, street, city, postal_code, business_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING provider_id, first_name, last_name, email, business_name, verification_status`,
      [first_name, last_name, normalizedEmail, password_hash, phone_number, street, city, postal_code, business_name]
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
  const normalizedEmail = (email || '').toLowerCase().trim();

  try {
    const result = await db.query('SELECT * FROM MEAL_PROVIDER WHERE email = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.is_active === false) {
      return res.status(403).json({ status: 'fail', message: 'Your meal provider account has been suspended by an administrator.' });
    }

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
  const normalizedEmail = (email || '').toLowerCase().trim();

  try {
    const result = await db.query('SELECT * FROM ADMIN WHERE email = $1', [normalizedEmail]);
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
  const normalizedEmail = (email || '').toLowerCase().trim();

  try {
    const existing = await db.query('SELECT admin_id FROM ADMIN WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: 'fail', message: 'Admin email already registered.' });
    }

    const password_hash = await hashPassword(password);
    const result = await db.query(
      `INSERT INTO ADMIN (first_name, last_name, email, password_hash, access_level)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING admin_id, first_name, last_name, email, access_level`,
      [first_name, last_name, normalizedEmail, password_hash, access_level || 'superadmin']
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

// ==========================================
// 5. UNIFIED LOGIN (AUTO ROLE DETECTION)
// ==========================================
exports.unifiedLogin = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = (email || '').toLowerCase().trim();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ status: 'fail', message: 'Email and password are required.' });
  }

  try {
    // 1. Check Admin
    const adminRes = await db.query('SELECT * FROM ADMIN WHERE email = $1', [normalizedEmail]);
    if (adminRes.rows.length > 0) {
      const user = adminRes.rows[0];
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
      }
      delete user.password_hash;
      const token = generateToken({ id: user.admin_id, role: 'admin', email: user.email });
      return res.status(200).json({ status: 'success', token, data: { user: { ...user, role: 'admin' } } });
    }

    // 2. Check Student
    const studentRes = await db.query('SELECT * FROM STUDENT WHERE email = $1', [normalizedEmail]);
    if (studentRes.rows.length > 0) {
      const user = studentRes.rows[0];
      if (user.is_active === false) {
        return res.status(403).json({ status: 'fail', message: 'Your student account has been suspended by an administrator.' });
      }
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
      }
      delete user.password_hash;
      const token = generateToken({ id: user.student_id, role: 'student', email: user.email });
      return res.status(200).json({ status: 'success', token, data: { user: { ...user, role: 'student' } } });
    }

    // 3. Check Property Owner
    const ownerRes = await db.query('SELECT * FROM PROPERTY_OWNER WHERE email = $1', [normalizedEmail]);
    if (ownerRes.rows.length > 0) {
      const user = ownerRes.rows[0];
      if (user.is_active === false) {
        return res.status(403).json({ status: 'fail', message: 'Your property owner account has been suspended by an administrator.' });
      }
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
      return res.status(200).json({ status: 'success', token, data: { user: { ...user, role: 'property_owner' } } });
    }

    // 4. Check Meal Provider
    const providerRes = await db.query('SELECT * FROM MEAL_PROVIDER WHERE email = $1', [normalizedEmail]);
    if (providerRes.rows.length > 0) {
      const user = providerRes.rows[0];
      if (user.is_active === false) {
        return res.status(403).json({ status: 'fail', message: 'Your meal provider account has been suspended by an administrator.' });
      }
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
      return res.status(200).json({ status: 'success', token, data: { user: { ...user, role: 'meal_provider' } } });
    }

    // If no user found in any role table
    return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
  } catch (err) {
    console.error('Unified Login Error:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// ==========================================
// 6. PROFILE MANAGEMENT & SETTINGS
// ==========================================
exports.updateProfile = async (req, res) => {
  const { id, role } = req.user;
  const body = req.body;

  try {
    let result;
    if (role === 'student') {
      result = await db.query(
        `UPDATE STUDENT 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone_number = COALESCE($3, phone_number),
             street = COALESCE($4, street),
             city = COALESCE($5, city),
             postal_code = COALESCE($6, postal_code),
             university_name = COALESCE($7, university_name),
             student_id_number = COALESCE($8, student_id_number)
         WHERE student_id = $9
         RETURNING *`,
        [body.first_name, body.last_name, body.phone_number, body.street, body.city, body.postal_code, body.university_name, body.student_id_number, id]
      );
    } else if (role === 'property_owner') {
      result = await db.query(
        `UPDATE PROPERTY_OWNER 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone_number = COALESCE($3, phone_number),
             street = COALESCE($4, street),
             city = COALESCE($5, city),
             postal_code = COALESCE($6, postal_code)
         WHERE owner_id = $7
         RETURNING *`,
        [body.first_name, body.last_name, body.phone_number, body.street, body.city, body.postal_code, id]
      );
    } else if (role === 'meal_provider') {
      result = await db.query(
        `UPDATE MEAL_PROVIDER 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone_number = COALESCE($3, phone_number),
             street = COALESCE($4, street),
             city = COALESCE($5, city),
             postal_code = COALESCE($6, postal_code),
             business_name = COALESCE($7, business_name)
         WHERE provider_id = $8
         RETURNING *`,
        [body.first_name, body.last_name, body.phone_number, body.street, body.city, body.postal_code, body.business_name, id]
      );
    } else if (role === 'admin') {
      result = await db.query(
        `UPDATE ADMIN 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name)
         WHERE admin_id = $3
         RETURNING *`,
        [body.first_name, body.last_name, id]
      );
    }

    if (!result || result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    const updatedUser = result.rows[0];
    delete updatedUser.password_hash;
    res.status(200).json({ status: 'success', data: { user: { ...updatedUser, role } } });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update profile.' });
  }
};

// Upload Profile Picture (via Cloudinary)
exports.updateProfilePicture = async (req, res) => {
  const { id, role } = req.user;
  const cloudinary = require('../config/cloudinary');

  if (!req.file) {
    return res.status(400).json({ status: 'fail', message: 'No image file uploaded.' });
  }

  try {
    const imageUrl = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'unistay_profiles' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    let table, idCol;
    if (role === 'student') { table = 'STUDENT'; idCol = 'student_id'; }
    else if (role === 'property_owner') { table = 'PROPERTY_OWNER'; idCol = 'owner_id'; }
    else if (role === 'meal_provider') { table = 'MEAL_PROVIDER'; idCol = 'provider_id'; }
    else if (role === 'admin') { table = 'ADMIN'; idCol = 'admin_id'; }

    const result = await db.query(
      `UPDATE ${table} SET profile_image = $1 WHERE ${idCol} = $2 RETURNING *`,
      [imageUrl, id]
    );

    const user = result.rows[0];
    delete user.password_hash;
    res.status(200).json({
      status: 'success',
      message: 'Profile picture updated successfully',
      data: { profile_image: imageUrl, user: { ...user, role } }
    });
  } catch (err) {
    console.error('Update Profile Picture Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to upload profile picture.' });
  }
};

// Change Password with current password verification
exports.changePassword = async (req, res) => {
  const { id, role } = req.user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ status: 'fail', message: 'Both current password and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ status: 'fail', message: 'New password must be at least 6 characters.' });
  }

  try {
    let table, idCol;
    if (role === 'student') { table = 'STUDENT'; idCol = 'student_id'; }
    else if (role === 'property_owner') { table = 'PROPERTY_OWNER'; idCol = 'owner_id'; }
    else if (role === 'meal_provider') { table = 'MEAL_PROVIDER'; idCol = 'provider_id'; }
    else if (role === 'admin') { table = 'ADMIN'; idCol = 'admin_id'; }

    const userResult = await db.query(`SELECT password_hash FROM ${table} WHERE ${idCol} = $1`, [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ status: 'fail', message: 'Current password does not match.' });
    }

    const newHash = await hashPassword(newPassword);
    await db.query(`UPDATE ${table} SET password_hash = $1 WHERE ${idCol} = $2`, [newHash, id]);

    res.status(200).json({ status: 'success', message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change Password Error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to change password.' });
  }
};

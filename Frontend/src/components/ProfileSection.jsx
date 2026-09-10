import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  User, Mail, Phone, MapPin, Building, Lock, 
  Camera, CheckCircle2, AlertCircle, Save, KeyRound, Shield
} from 'lucide-react';
import './ProfileSection.css';

export default function ProfileSection() {
  const { user, updateUser } = useAuth();

  // Profile Information Form State
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    street: user?.street || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
    university_name: user?.university_name || '',
    student_id_number: user?.student_id_number || '',
    business_name: user?.business_name || '',
  });

  // Password Change Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI States
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState({ type: '', text: '' });

  // Handle Profile Details Input Change
  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Password Details Input Change
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // 1. Submit Profile Details Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const res = await API.put('/auth/profile', formData);
      const updatedUser = res.data?.data?.user;
      if (updatedUser) {
        updateUser(updatedUser);
      }
      setProfileMsg({ type: 'success', text: 'Profile details updated successfully!' });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setProfileMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile details.' 
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // 2. Submit Profile Picture Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarMsg({ type: 'error', text: 'Please select an image file (PNG, JPG, JPEG).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarMsg({ type: 'error', text: 'Image file size must be less than 5MB.' });
      return;
    }

    setAvatarLoading(true);
    setAvatarMsg({ type: '', text: '' });

    try {
      const data = new FormData();
      data.append('profileImage', file);

      const res = await API.post('/auth/profile-picture', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = res.data?.data?.user;
      const imageUrl = res.data?.data?.profile_image;

      if (updatedUser) {
        updateUser(updatedUser);
      } else if (imageUrl) {
        updateUser({ profile_image: imageUrl });
      }

      setAvatarMsg({ type: 'success', text: 'Profile picture updated successfully!' });
      setTimeout(() => setAvatarMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setAvatarMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to upload profile picture.' 
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  // 3. Submit Change Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setPasswordLoading(true);

    try {
      await API.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setPasswordMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to change password. Please verify current password.' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const getRoleDisplayName = () => {
    if (user?.role === 'student') return 'University Student';
    if (user?.role === 'property_owner') return 'Property Owner';
    if (user?.role === 'meal_provider') return 'Meal Provider';
    if (user?.role === 'admin') return 'System Administrator';
    return 'User';
  };

  return (
    <div className="profile-section-container">
      {/* 1. PROFILE HEADER CARD WITH AVATAR UPLOAD */}
      <div className="profile-header-card">
        <div className="avatar-upload-wrapper">
          <div className="avatar-display">
            {user?.profile_image ? (
              <img 
                src={user.profile_image} 
                alt={`${user.first_name || 'User'}`} 
                className="profile-avatar-img" 
              />
            ) : (
              <div className="avatar-placeholder">
                <User size={48} />
              </div>
            )}
            
            <label className="avatar-edit-badge" title="Change profile picture">
              <Camera size={16} />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                disabled={avatarLoading}
                style={{ display: 'none' }} 
              />
            </label>
          </div>

          <div className="avatar-info-col">
            <h2>{user?.first_name} {user?.last_name}</h2>
            <div className="user-meta-tags">
              <span className="role-tag"><Shield size={13} /> {getRoleDisplayName()}</span>
              <span className="email-tag"><Mail size={13} /> {user?.email}</span>
            </div>
            {avatarLoading && <p className="avatar-uploading-text">Uploading image to cloud...</p>}
            {avatarMsg.text && (
              <div className={`status-pill-msg ${avatarMsg.type}`}>
                {avatarMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{avatarMsg.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-grid-layout">
        {/* 2. EDIT PROFILE DETAILS FORM */}
        <div className="profile-form-card">
          <div className="card-heading">
            <User size={20} className="card-heading-icon" />
            <div>
              <h3>Profile Information</h3>
              <p>Update your personal details and contact information</p>
            </div>
          </div>

          {profileMsg.text && (
            <div className={`alert-box ${profileMsg.type}`}>
              {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-row-2">
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  name="first_name" 
                  required 
                  placeholder="e.g. Dilan"
                  value={formData.first_name} 
                  onChange={handleProfileChange} 
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  name="last_name" 
                  required 
                  placeholder="e.g. Fernando"
                  value={formData.last_name} 
                  onChange={handleProfileChange} 
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  disabled 
                  value={user?.email || ''} 
                  className="input-disabled"
                  title="Email cannot be changed directly"
                />
              </div>

              {user?.role === 'admin' ? (
                <div className="form-group">
                  <label>Access Level</label>
                  <input 
                    type="text" 
                    disabled 
                    value={user?.access_level?.toUpperCase() || 'SUPERADMIN'} 
                    className="input-disabled"
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone_number" 
                    placeholder="e.g. 0771234567"
                    value={formData.phone_number} 
                    onChange={handleProfileChange} 
                  />
                </div>
              )}
            </div>

            {/* ROLE SPECIFIC FIELDS */}
            {user?.role === 'student' && (
              <div className="form-row-2">
                <div className="form-group">
                  <label>University / Campus</label>
                  <input 
                    type="text" 
                    name="university_name" 
                    placeholder="e.g. University of Moratuwa"
                    value={formData.university_name} 
                    onChange={handleProfileChange} 
                  />
                </div>

                <div className="form-group">
                  <label>Student ID Number</label>
                  <input 
                    type="text" 
                    name="student_id_number" 
                    placeholder="e.g. 210045A"
                    value={formData.student_id_number} 
                    onChange={handleProfileChange} 
                  />
                </div>
              </div>
            )}

            {user?.role === 'meal_provider' && (
              <div className="form-group">
                <label>Business / Kitchen Name</label>
                <input 
                  type="text" 
                  name="business_name" 
                  placeholder="e.g. Campus Delight Catering"
                  value={formData.business_name} 
                  onChange={handleProfileChange} 
                />
              </div>
            )}

            {user?.role !== 'admin' && (
              <>
                <div className="form-group">
                  <label>Street Address</label>
                  <input 
                    type="text" 
                    name="street" 
                    placeholder="e.g. 12/A Galle Road"
                    value={formData.street} 
                    onChange={handleProfileChange} 
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      name="city" 
                      placeholder="e.g. Moratuwa"
                      value={formData.city} 
                      onChange={handleProfileChange} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Postal Code</label>
                    <input 
                      type="text" 
                      name="postal_code" 
                      placeholder="e.g. 10400"
                      value={formData.postal_code} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-save" disabled={profileLoading}>
              <Save size={16} /> {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* 3. CHANGE PASSWORD CARD */}
        <div className="profile-form-card">
          <div className="card-heading">
            <KeyRound size={20} className="card-heading-icon" />
            <div>
              <h3>Security & Password</h3>
              <p>Change your password with current password verification</p>
            </div>
          </div>

          {passwordMsg.text && (
            <div className={`alert-box ${passwordMsg.type}`}>
              {passwordMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                name="currentPassword" 
                required 
                placeholder="Enter your current password"
                value={passwordData.currentPassword} 
                onChange={handlePasswordChange} 
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                name="newPassword" 
                required 
                minLength="6"
                placeholder="At least 6 characters"
                value={passwordData.newPassword} 
                onChange={handlePasswordChange} 
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                required 
                minLength="6"
                placeholder="Re-enter new password"
                value={passwordData.confirmPassword} 
                onChange={handlePasswordChange} 
              />
            </div>

            <button type="submit" className="btn btn-outline btn-save" disabled={passwordLoading}>
              <Lock size={16} /> {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

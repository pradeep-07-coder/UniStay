import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  User, Home, Utensils, UserPlus, AlertCircle, 
  Lock, Mail, Phone, MapPin, Building2, GraduationCap, 
  Award, Navigation, Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight 
} from 'lucide-react';
import unistayLogo from '../assets/unistay_logo.jpg';
import './AuthPages.css';

export default function Register() {
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Common User Form Fields
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    street: '',
    city: '',
    postal_code: '',
    // Role-Specific Fields
    university_name: '',
    student_id_number: '',
    business_name: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = `/auth/register/${role === 'property_owner' ? 'owner' : role === 'meal_provider' ? 'provider' : 'student'}`;
      const res = await API.post(endpoint, formData);

      const { token, data } = res.data;
      login(data.user, token);

      // Redirect based on role
      if (role === 'property_owner') navigate('/owner/dashboard');
      else if (role === 'meal_provider') navigate('/provider/dashboard');
      else navigate('/accommodations');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please verify your input.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleClass = () => {
    if (role === 'student') return 'role-card-student';
    if (role === 'property_owner') return 'role-card-owner';
    return 'role-card-provider';
  };

  return (
    <div className="auth-container">
      <div className="auth-backdrop-decoration auth-backdrop-1"></div>
      <div className="auth-backdrop-decoration auth-backdrop-2"></div>

      <div className={`auth-card register-card ${getRoleClass()}`}>
        <div className="auth-card-top-bar"></div>

        <div className="auth-header">
          <div className="auth-brand-badge">
            <img src={unistayLogo} alt="UniStay Logo" className="auth-logo-img" />
          </div>
          <div className="auth-pill-badge">
            <Sparkles size={12} />
            <span>Join Sri Lanka's #1 Campus Living Network</span>
          </div>
          <h2>Create Your UniStay Account</h2>
          <p>Choose your account type to access specialized campus tools</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="role-tabs-wrapper">
          <label className="role-tabs-label">I am joining as a:</label>
          <div className="role-tabs">
            <button
              type="button"
              className={`tab-btn tab-btn-student ${role === 'student' ? 'active' : ''}`}
              onClick={() => { setRole('student'); setError(''); }}
            >
              <div className="tab-icon-wrap">
                <User size={18} />
              </div>
              <div className="tab-text-wrap">
                <strong>Student</strong>
                <span>Hostels &amp; Meals</span>
              </div>
            </button>

            <button
              type="button"
              className={`tab-btn tab-btn-owner ${role === 'property_owner' ? 'active' : ''}`}
              onClick={() => { setRole('property_owner'); setError(''); }}
            >
              <div className="tab-icon-wrap">
                <Home size={18} />
              </div>
              <div className="tab-text-wrap">
                <strong>Property Owner</strong>
                <span>List Boarding</span>
              </div>
            </button>

            <button
              type="button"
              className={`tab-btn tab-btn-provider ${role === 'meal_provider' ? 'active' : ''}`}
              onClick={() => { setRole('meal_provider'); setError(''); }}
            >
              <div className="tab-icon-wrap">
                <Utensils size={18} />
              </div>
              <div className="tab-text-wrap">
                <strong>Meal Provider</strong>
                <span>Catering &amp; Plans</span>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="auth-error animate-fade-in">
            <AlertCircle size={18} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form grid-form">
          {/* Section: Basic Identity */}
          <div className="form-section-title full-width">
            <span>Personal Information</span>
          </div>

          <div className="form-group">
            <label htmlFor="reg-first-name">First Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input 
                id="reg-first-name"
                type="text" 
                name="first_name" 
                placeholder="e.g. Kasun"
                required 
                value={formData.first_name} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-last-name">Last Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input 
                id="reg-last-name"
                type="text" 
                name="last_name" 
                placeholder="e.g. Perera"
                required 
                value={formData.last_name} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="reg-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                id="reg-email"
                type="email" 
                name="email" 
                placeholder="kasun.p@gmail.com or student@uom.lk"
                required 
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                id="reg-password"
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                placeholder="At least 6 characters"
                required 
                value={formData.password} 
                onChange={handleChange} 
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-phone">Phone Number</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input 
                id="reg-phone"
                type="text" 
                name="phone_number" 
                placeholder="0771234567" 
                required 
                value={formData.phone_number} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Student Specific Fields */}
          {role === 'student' && (
            <>
              <div className="form-section-title full-width">
                <span>Campus Verification Details</span>
              </div>

              <div className="form-group">
                <label htmlFor="reg-uni">University / Campus</label>
                <div className="input-with-icon select-with-icon">
                  <GraduationCap size={18} className="input-icon" />
                  <select 
                    id="reg-uni"
                    name="university_name" 
                    value={formData.university_name} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="" disabled>-- Select University --</option>
                    <option value="University of Moratuwa">University of Moratuwa</option>
                    <option value="University of Colombo">University of Colombo</option>
                    <option value="University of Kelaniya">University of Kelaniya</option>
                    <option value="University of Sri Jayewardenepura">University of Sri Jayewardenepura</option>
                    <option value="University of Peradeniya">University of Peradeniya</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-student-id">Student ID / Registration No.</label>
                <div className="input-with-icon">
                  <Award size={18} className="input-icon" />
                  <input 
                    id="reg-student-id"
                    type="text" 
                    name="student_id_number" 
                    placeholder="e.g. 210045A or ST-8821" 
                    required 
                    value={formData.student_id_number} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </>
          )}

          {/* Meal Provider Specific Fields */}
          {role === 'meal_provider' && (
            <>
              <div className="form-section-title full-width">
                <span>Culinary &amp; Catering Service Details</span>
              </div>

              <div className="form-group full-width">
                <label htmlFor="reg-business-name">Business / Kitchen Name</label>
                <div className="input-with-icon">
                  <Building2 size={18} className="input-icon" />
                  <input 
                    id="reg-business-name"
                    type="text" 
                    name="business_name" 
                    placeholder="e.g. Campus Fresh Bistro &amp; Daily Meals" 
                    required 
                    value={formData.business_name} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </>
          )}

          {/* Address Fields */}
          <div className="form-section-title full-width">
            <span>Location &amp; Address</span>
          </div>

          <div className="form-group full-width">
            <label htmlFor="reg-street">Street Address</label>
            <div className="input-with-icon">
              <MapPin size={18} className="input-icon" />
              <input 
                id="reg-street"
                type="text" 
                name="street" 
                placeholder="e.g. No. 42, Galle Road"
                value={formData.street} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-city">City</label>
            <div className="input-with-icon">
              <Navigation size={18} className="input-icon" />
              <input 
                id="reg-city"
                type="text" 
                name="city" 
                placeholder="e.g. Moratuwa"
                value={formData.city} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-postal">Postal Code</label>
            <div className="input-with-icon">
              <MapPin size={18} className="input-icon" />
              <input 
                id="reg-postal"
                type="text" 
                name="postal_code" 
                placeholder="e.g. 10400"
                value={formData.postal_code} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="full-width reg-submit-wrap">
            <button type="submit" className="btn btn-primary btn-block btn-reg-submit" disabled={loading}>
              <UserPlus size={18} /> 
              <span>
                {loading ? 'Creating Account...' : `Register as ${role === 'property_owner' ? 'Property Owner' : role === 'meal_provider' ? 'Meal Provider' : 'Student'}`}
              </span>
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account? <Link to="/login" className="auth-inline-link">Sign In to UniStay <ArrowRight size={14} /></Link>
          </p>
          <div className="auth-trust-note">
            <ShieldCheck size={14} />
            <span>100% Free Registration &bull; Direct Owner Connect &bull; Barcode Meal Passes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
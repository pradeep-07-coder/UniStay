import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { LogIn, AlertCircle, Lock, Mail, Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import unistayLogo from '../assets/unistay_logo.jpg';
import './AuthPages.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Unified login endpoint automatically resolves role across student, owner, provider, admin
      const res = await API.post('/auth/login', { email, password });
      const { token, data } = res.data;
      const user = data.user;

      login(user, token);

      // Automated redirection to dedicated dashboard based on backend-detected role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'property_owner') {
        navigate('/owner/dashboard');
      } else if (user.role === 'meal_provider') {
        navigate('/provider/dashboard');
      } else if (user.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-backdrop-decoration auth-backdrop-1"></div>
      <div className="auth-backdrop-decoration auth-backdrop-2"></div>
      
      <div className="auth-card">
        <div className="auth-card-top-bar"></div>
        
        <div className="auth-header">
          <div className="auth-brand-badge">
            <img src={unistayLogo} alt="UniStay Logo" className="auth-logo-img" />
          </div>
          <div className="auth-pill-badge">
            <Sparkles size={12} />
            <span>Secure Student &amp; Provider Access</span>
          </div>
          <h2>Sign In to UniStay</h2>
          <p>Universal portal for Students, Property Owners, Meal Providers &amp; Admins</p>
        </div>

        {error && (
          <div className="auth-error animate-fade-in">
            <AlertCircle size={18} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Registered Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                placeholder="name@university.lk or user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-aside">
              <label htmlFor="login-password">Password</label>
              <Link to="/contact" className="forgot-password-link">Forgot password?</Link>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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

          <button type="submit" className="btn btn-primary btn-block btn-login-submit" disabled={loading}>
            <LogIn size={18} /> {loading ? 'Verifying Account...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="auth-divider">
          <span>New to UniStay?</span>
        </div>

        <div className="auth-footer">
          <Link to="/register" className="btn-create-account">
            <span>Create a Free Account</span>
            <ArrowRight size={16} />
          </Link>
          <div className="auth-trust-note">
            <ShieldCheck size={14} />
            <span>256-bit SSL Encrypted &bull; Admin Verified Community</span>
          </div>
        </div>
      </div>
    </div>
  );
}
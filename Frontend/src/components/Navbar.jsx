import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Ticket, Bell, LogOut, User, CheckCheck, Menu, X, Sparkles } from 'lucide-react';
import unistayLogo from '../assets/unistay_logo.jpg';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const popupRef = useRef(null);

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Click outside to close notification popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowNotifPopup(false);
      }
    };
    if (showNotifPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifPopup]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      const list = res.data?.data?.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (err) {
      console.warn('Could not load notifications:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.is_read).map((n) => API.patch(`/notifications/${n.notification_id}/read`))
      );
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const isStudent = user && user.role === 'student';

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'property_owner') return '/owner/dashboard';
    if (user.role === 'meal_provider') return '/provider/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const getProfileRoute = () => {
    return `${getDashboardRoute()}?tab=profile`;
  };

  const getRoleBadgeInfo = () => {
    if (!user) return null;
    switch (user.role) {
      case 'student':
        return { label: 'Student', className: 'role-student' };
      case 'property_owner':
        return { label: 'Owner', className: 'role-owner' };
      case 'meal_provider':
        return { label: 'Provider', className: 'role-provider' };
      case 'admin':
        return { label: 'Admin', className: 'role-admin' };
      default:
        return { label: user.role, className: 'role-student' };
    }
  };

  const roleInfo = getRoleBadgeInfo();

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* BRAND LOGO */}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-wrapper">
            <span className="brand-logo-aura"></span>
            <img src={unistayLogo} alt="UniStay Logo" className="brand-logo-img" />
          </div>
          <div className="brand-text-group">
            <span className="brand-title">Uni<span className="brand-highlight">Stay</span><span className="brand-dot">.</span></span>
            <span className="brand-badge"><span className="pulse-dot"></span>Campus Living</span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="navbar-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/accommodations" className={location.pathname.startsWith('/accommodations') ? 'active' : ''}>Accommodations</Link>
          <Link to="/meal-plans" className={location.pathname.startsWith('/meal-plans') ? 'active' : ''}>Meal Plans</Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
          {user && (
            <Link 
              to={getDashboardRoute()} 
              className={`highlight-link ${location.pathname.includes('/dashboard') ? 'active' : ''}`}
            >
              <Sparkles size={14} className="sparkle-icon-animated" /> Dashboard
            </Link>
          )}
        </nav>

        {/* DESKTOP & GLOBAL ACTIONS */}
        <div className="navbar-actions">
          {/* 1. NOTIFICATION ICON WITH RED DOT & POPUP */}
          {user && (
            <div className="notification-rel-container" ref={popupRef}>
              <button
                className={`icon-btn-rounded notif-bell-btn ${unreadCount > 0 ? 'notif-bell-active' : ''}`}
                onClick={() => setShowNotifPopup(!showNotifPopup)}
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="notification-red-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {/* FLOATING NOTIFICATION POPUP WINDOW */}
              {showNotifPopup && (
                <div className="notification-popup">
                  <div className="popup-header">
                    <div className="popup-title-wrap">
                      <h4>Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="popup-unread-badge">{unreadCount} unread</span>
                      )}
                    </div>
                    {unreadCount > 0 ? (
                      <button 
                        onClick={handleMarkAllAsRead} 
                        className="btn-mark-all-read"
                      >
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    ) : (
                      <span className="popup-all-read-badge">All caught up</span>
                    )}
                  </div>
                  <div className="popup-body">
                    {notifications.length === 0 ? (
                      <div className="empty-notif">
                        <Bell size={28} className="empty-notif-icon" />
                        <p>No notifications received yet.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.notification_id}
                          className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                          onClick={() => handleMarkAsRead(n.notification_id)}
                          title="Click to mark as read"
                        >
                          <div className="notif-header-line">
                            <strong>{n.title}</strong>
                            {!n.is_read && <span className="notif-unread-dot" />}
                          </div>
                          <p>{n.message}</p>
                          <small>{new Date(n.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. FOOD VOUCHERS BUTTON - Visible ONLY to Students */}
          {isStudent && (
            <Link 
              to="/vouchers" 
              className={`icon-btn-rounded vouchers-quick-btn ${location.pathname === '/vouchers' ? 'active' : ''}`}
              title="Student Food Vouchers & Passes"
              aria-label="Student Food Vouchers"
            >
              <Ticket size={18} />
            </Link>
          )}

          {/* 3. USER PROFILE CHIP (Desktop) */}
          {user && (
            <Link 
              to={getProfileRoute()} 
              className="navbar-user-chip" 
              title="My Profile & Account Settings"
            >
              <div className="navbar-avatar-circle">
                {user.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt={user.first_name || 'User'} 
                    className="navbar-avatar-img" 
                  />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="navbar-user-meta">
                <span className="navbar-user-name">{user.first_name || 'Account'}</span>
                {roleInfo && (
                  <span className={`navbar-role-pill ${roleInfo.className}`}>
                    {roleInfo.label}
                  </span>
                )}
              </div>
            </Link>
          )}

          {/* 4. LOGOUT OR LOGIN BUTTON (Desktop) */}
          <div className="desktop-auth-btns">
            {user ? (
              <button className="btn-logout" onClick={logout} title="Sign Out">
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            ) : (
              <div className="guest-nav-actions">
                <Link to="/login" className="btn-login-ghost">Login</Link>
                <Link to="/register" className="btn-register-primary">Get Started</Link>
              </div>
            )}
          </div>

          {/* 5. MOBILE HAMBURGER BUTTON */}
          <button 
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {user && (
            <div className="mobile-user-card">
              <div className="navbar-avatar-circle">
                {user.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt={user.first_name || 'User'} 
                    className="navbar-avatar-img" 
                  />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="mobile-user-details">
                <strong>{user.first_name} {user.last_name}</strong>
                <span className="mobile-user-email">{user.email}</span>
                {roleInfo && (
                  <span className={`navbar-role-pill ${roleInfo.className}`}>
                    {roleInfo.label}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="mobile-nav-links">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/accommodations" onClick={() => setMobileMenuOpen(false)}>Accommodations</Link>
            <Link to="/meal-plans" onClick={() => setMobileMenuOpen(false)}>Meal Plans</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            {user && (
              <>
                <Link 
                  to={getDashboardRoute()} 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="mobile-highlight-link"
                >
                  <Sparkles size={16} /> Portal Dashboard
                </Link>
                <Link to={getProfileRoute()} onClick={() => setMobileMenuOpen(false)}>
                  <User size={16} /> Profile & Settings
                </Link>
              </>
            )}
            {isStudent && (
              <Link to="/vouchers" onClick={() => setMobileMenuOpen(false)} className="mobile-voucher-link">
                <Ticket size={16} /> Student Food Vouchers
              </Link>
            )}
          </div>

          <div className="mobile-nav-footer">
            {user ? (
              <button 
                className="btn-logout mobile-full-btn" 
                onClick={() => { logout(); setMobileMenuOpen(false); }}
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <div className="mobile-auth-actions">
                <Link to="/login" className="btn-login-ghost mobile-full-btn" onClick={() => setMobileMenuOpen(false)}>
                  Login to Account
                </Link>
                <Link to="/register" className="btn-register-primary mobile-full-btn" onClick={() => setMobileMenuOpen(false)}>
                  Create Free Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
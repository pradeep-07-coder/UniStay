import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import ProfileSection from '../components/ProfileSection';
import { 
  Hotel, ShoppingBag, Ticket, LayoutDashboard, Calendar, 
  Clock, CheckCircle, XCircle, Phone, RefreshCw, User,
  ChevronRight, LogOut, ShieldCheck, MapPin, Sparkles, ExternalLink
} from 'lucide-react';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Sidebar Section State
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');

  // Primary Data States
  const [bookings, setBookings] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [foodOrders, setFoodOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  useEffect(() => {
    fetchAllStudentData();
  }, []);

  const fetchAllStudentData = async () => {
    setLoading(true);
    setError('');

    try {
      const [bookingsRes, vouchersRes, ordersRes] = await Promise.all([
        API.get('/bookings/student').catch(() => ({ data: { data: { bookings: [] } } })),
        API.get('/subscriptions/student/vouchers').catch(() => ({ data: { data: { vouchers: [] } } })),
        API.get('/food-orders/student').catch(() => ({ data: { data: { orders: [] } } }))
      ]);

      setBookings(bookingsRes.data?.data?.bookings || []);
      setVouchers(vouchersRes.data?.data?.vouchers || []);
      setFoodOrders(ordersRes.data?.data?.orders || []);
    } catch (err) {
      console.error('Student Dashboard Fetch Error:', err);
      setError('Failed to refresh dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel Pending Booking Request
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;

    setActionLoading(true);
    try {
      await API.patch(`/bookings/${bookingId}/cancel`);
      await fetchAllStudentData();
    } catch (err) {
      console.error('Cancel Booking Error:', err);
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="student-dashboard-layout">
      {/* SIDEBAR NAVIGATION */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Hotel size={20} />
          </div>
          <div className="sidebar-brand-text">
            <h2>Student Portal</h2>
            <span className="role-indicator">Undergraduate Hub</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Overview</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'accommodations' ? 'active' : ''}`}
            onClick={() => handleTabChange('accommodations')}
          >
            <Hotel size={18} />
            <span>Accommodation Requests</span>
            {bookings.length > 0 && <span className="nav-badge">{bookings.length}</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'vouchers' ? 'active' : ''}`}
            onClick={() => handleTabChange('vouchers')}
          >
            <Ticket size={18} />
            <span>Food Vouchers</span>
            {vouchers.length > 0 && <span className="nav-badge">{vouchers.length}</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <ShoppingBag size={18} />
            <span>My Food Orders</span>
            {foodOrders.length > 0 && <span className="nav-badge">{foodOrders.length}</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <User size={18} />
            <span>My Profile</span>
          </button>
        </nav>

        {/* SIDEBAR FOOTER USER PROFILE */}
        <div className="sidebar-footer">
          <div 
            className="user-avatar-mini" 
            onClick={() => handleTabChange('profile')} 
            title="View Profile"
          >
            {user?.profile_image ? (
              <img 
                src={user.profile_image} 
                alt={user.first_name} 
                className="user-avatar-mini-img"
              />
            ) : (
              <User size={16} />
            )}
          </div>
          <div className="user-details-mini" onClick={() => handleTabChange('profile')}>
            <span className="user-name">{user?.first_name} {user?.last_name}</span>
            <span className="user-id">ID: {user?.student_id_number || 'STU-AUTH'}</span>
          </div>
          <button className="logout-icon-btn" onClick={logout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="dashboard-main-content">
        {/* HEADER TOPBAR */}
        <header className="topbar">
          <div className="topbar-welcome">
            <div className="welcome-tag">
              <Sparkles size={14} />
              <span>Student Dashboard</span>
            </div>
            <h1>Welcome back, {user?.first_name || 'Student'}! 👋</h1>
            <p><MapPin size={14} className="inline-icon" /> {user?.university_name || 'Campus University'} • Verified Undergraduate</p>
          </div>

          <div className="topbar-actions">
            <button onClick={fetchAllStudentData} className="btn btn-outline btn-refresh" disabled={loading}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button 
              className="topbar-avatar-btn"
              onClick={() => handleTabChange('profile')}
              title="My Profile & Settings"
            >
              {user?.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt={user.first_name} 
                  className="topbar-avatar-img"
                />
              ) : (
                <User size={18} />
              )}
            </button>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="dashboard-loading-state">
            <div className="spinner"></div>
            <p>Loading your dashboard metrics...</p>
          </div>
        ) : (
          <>
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="tab-pane">
                <ProfileSection />
              </div>
            )}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="tab-pane">
                {/* METRICS STAT CARDS */}
                <div className="stats-grid">
                  <div className="stat-card" onClick={() => handleTabChange('accommodations')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon icon-sky">
                      <Hotel size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{bookings.length}</span>
                      <span className="stat-label">Accommodations Booked</span>
                      <span className="stat-sub">Active requests & boarding</span>
                    </div>
                  </div>

                  <div className="stat-card" onClick={() => handleTabChange('vouchers')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon icon-emerald">
                      <Ticket size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{vouchers.length}</span>
                      <span className="stat-label">Active Food Passes</span>
                      <span className="stat-sub">Prepaid digital meal vouchers</span>
                    </div>
                  </div>

                  <div className="stat-card" onClick={() => handleTabChange('orders')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon icon-amber">
                      <ShoppingBag size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{foodOrders.length}</span>
                      <span className="stat-label">Daily Orders Placed</span>
                      <span className="stat-sub">Breakfast, lunch & dinner</span>
                    </div>
                  </div>
                </div>

                {/* QUICK PREVIEW TILES */}
                <div className="overview-split-grid">
                  {/* Latest Booking Card */}
                  <div className="dashboard-card">
                    <div className="card-header-bar">
                      <div>
                        <h3>Latest Accommodation Request</h3>
                        <p className="card-sub-desc">Status of your most recent housing inquiry</p>
                      </div>
                      <button className="text-action-btn" onClick={() => handleTabChange('accommodations')}>
                        View All <ChevronRight size={14} />
                      </button>
                    </div>
                    {bookings.length === 0 ? (
                      <div className="card-empty-state">
                        <Hotel size={36} className="empty-state-icon" />
                        <p>No active accommodation requests found.</p>
                        <Link to="/accommodations" className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                          Browse Accommodations
                        </Link>
                      </div>
                    ) : (
                      <div className="latest-item-preview">
                        <h4>{bookings[0].title}</h4>
                        <p className="item-sub"><MapPin size={14} /> {bookings[0].street}, {bookings[0].city}</p>
                        <div className="preview-meta">
                          <span>Check-in: <strong>{new Date(bookings[0].check_in_date).toLocaleDateString()}</strong></span>
                          <span className={`status-pill pill-${bookings[0].status}`}>{bookings[0].status.toUpperCase()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Food Pass Status */}
                  <div className="dashboard-card">
                    <div className="card-header-bar">
                      <div>
                        <h3>Digital Meal Pass</h3>
                        <p className="card-sub-desc">Current active meal wallet balance</p>
                      </div>
                      <button className="text-action-btn" onClick={() => handleTabChange('vouchers')}>
                        Vouchers <ChevronRight size={14} />
                      </button>
                    </div>
                    {vouchers.length === 0 ? (
                      <div className="card-empty-state">
                        <Ticket size={36} className="empty-state-icon" />
                        <p>No active food voucher pass found.</p>
                        <Link to="/vouchers" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                          Get Meal Pass
                        </Link>
                      </div>
                    ) : (
                      <div className="latest-item-preview">
                        <h4>{vouchers[0].tier_name} Meal Pass</h4>
                        <p className="item-sub">Voucher Code: <code>{vouchers[0].voucher_code}</code></p>
                        <div className="preview-meta">
                          <span>Balance: <strong>LKR {parseFloat(vouchers[0].remaining_balance).toLocaleString()}</strong></span>
                          <span className={`status-pill pill-${vouchers[0].status}`}>{vouchers[0].status.toUpperCase()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ACCOMMODATIONS TAB */}
            {activeTab === 'accommodations' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div>
                    <h2>My Accommodation Requests</h2>
                    <p className="pane-subtitle">Manage room reservations and track landlord approvals</p>
                  </div>
                  <span className="count-tag">{bookings.length} Listings</span>
                </div>

                {bookings.length === 0 ? (
                  <div className="modern-empty-state">
                    <Hotel size={44} className="empty-state-icon" />
                    <h3>No Bookings Found</h3>
                    <p>You haven't requested any accommodations yet. Explore nearby verified student housing options.</p>
                    <Link to="/accommodations" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                      Browse Available Accommodations
                    </Link>
                  </div>
                ) : (
                  <div className="bookings-list-layout">
                    {bookings.map((b) => (
                      <div key={b.booking_id} className="booking-item-card">
                        <div className="booking-info-col">
                          <h3>{b.title}</h3>
                          <p className="loc-text"><MapPin size={14} /> {b.street}, {b.city}</p>
                          <div className="meta-chips">
                            <span>Check-In: <strong>{new Date(b.check_in_date).toLocaleDateString()}</strong></span>
                            {b.check_out_date && <span>Check-Out: <strong>{new Date(b.check_out_date).toLocaleDateString()}</strong></span>}
                            <span>Rent: <strong>LKR {parseFloat(b.price_per_month).toLocaleString()}/mo</strong></span>
                          </div>
                          {b.owner_phone && (
                            <p className="owner-contact"><Phone size={14} /> Contact Landlord: {b.owner_phone}</p>
                          )}
                        </div>

                        <div className="booking-action-col">
                          <span className={`status-pill pill-${b.status}`}>
                            {b.status.toUpperCase()}
                          </span>
                          {b.status === 'pending' && (
                            <button 
                              onClick={() => handleCancelBooking(b.booking_id)} 
                              className="btn-cancel-req"
                              disabled={actionLoading}
                            >
                              <XCircle size={14} /> Cancel Request
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FOOD VOUCHERS TAB */}
            {activeTab === 'vouchers' && (
              <div className="tab-pane">
                <div className="pane-header pane-header-between">
                  <div>
                    <h2>Active Food Vouchers</h2>
                    <p className="pane-subtitle">Present these voucher codes to partner catering kitchens</p>
                  </div>
                  <Link to="/vouchers" className="btn btn-primary btn-sm">
                    + Purchase New Voucher
                  </Link>
                </div>

                {vouchers.length === 0 ? (
                  <div className="modern-empty-state">
                    <Ticket size={44} className="empty-state-icon" />
                    <h3>No Digital Food Vouchers</h3>
                    <p>Purchase a Basic, Standard, or Premium voucher to pay for meals seamlessly at partner vendors.</p>
                    <Link to="/vouchers" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                      Get Food Voucher Pass
                    </Link>
                  </div>
                ) : (
                  <div className="vouchers-flex-grid">
                    {vouchers.map((v) => (
                      <div key={v.voucher_id} className={`digital-voucher-card status-${v.status}`}>
                        <div className="voucher-card-top">
                          <div className="voucher-brand">
                            <ShieldCheck size={16} /> UniStay Student Pass
                          </div>
                          <span className={`pill-badge pill-${v.status}`}>
                            {v.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="voucher-card-body">
                          <span className="voucher-tier">{v.tier_name} Tier Pass</span>
                          <div className="code-display-box">
                            <span className="code-label">Show Voucher Code to Provider:</span>
                            <code className="code-value">{v.voucher_code}</code>
                          </div>
                        </div>

                        <div className="voucher-card-footer">
                          <span>Remaining Balance</span>
                          <strong>LKR {parseFloat(v.remaining_balance).toLocaleString()}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FOOD ORDERS TAB (ITEMIZED DETAILS) */}
            {activeTab === 'orders' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div>
                    <h2>My Food Orders</h2>
                    <p className="pane-subtitle">Itemized history of all meals purchased through your meal plans</p>
                  </div>
                  <span className="count-tag">{foodOrders.length} Orders</span>
                </div>

                {foodOrders.length === 0 ? (
                  <div className="modern-empty-state">
                    <ShoppingBag size={44} className="empty-state-icon" />
                    <h3>No Orders Placed Yet</h3>
                    <p>Explore meal plans and place daily breakfast, lunch, or dinner choices.</p>
                    <Link to="/meal-plans" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                      Browse Meal Plans
                    </Link>
                  </div>
                ) : (
                  <div className="orders-table-card">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Meal Plan & Provider</th>
                          <th>Ordered Food Items</th>
                          <th>Total Order Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {foodOrders.map((order) => (
                          <tr key={order.order_id}>
                            <td>
                              <div className="order-date-main">{new Date(order.order_date).toLocaleDateString()}</div>
                              <div className="order-date-sub">{new Date(order.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td>
                              <strong>{order.plan_name}</strong>
                              <div className="provider-tag-sub">{order.business_name}</div>
                            </td>
                            <td>
                              <div className="food-items-stack">
                                {order.items && order.items.length > 0 ? (
                                  order.items.map((item, idx) => (
                                    <div key={idx} className="itemized-chip">
                                      <span className="chip-cat">{item.category}</span>
                                      <strong className="chip-name">{item.food_name}</strong>
                                      <span className="chip-qty">x{item.quantity}</span>
                                      <span className="chip-price">LKR {parseFloat(item.unit_price).toLocaleString()}</span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-dim-sub">Standard Menu Item</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <strong className="order-total-amount">
                                LKR {parseFloat(order.total_amount).toLocaleString()}
                              </strong>
                            </td>
                            <td>
                              <span className={`pill-badge pill-${(order.status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import ProfileSection from '../components/ProfileSection';
import { 
  Utensils, Plus, Clock, Trash2, RefreshCw, X, Users, History, 
  Wallet, ShoppingBag, Landmark, Send, CheckCircle, Image as ImageIcon,
  LayoutDashboard, Building2, LogOut, User, ChevronRight, Phone, Mail,
  UploadCloud, Sparkles, MapPin, GraduationCap, Navigation, Sun, Moon, 
  UtensilsCrossed, FileText, Tag
} from 'lucide-react';
import './ProviderDashboard.css';

export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Navigation Tab State ('overview' | 'orders' | 'packages' | 'wallet' | 'profile')
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');

  // Core Data States
  const [mealPlans, setMealPlans] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [universities, setUniversities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Order Voucher Input Mapping
  const [voucherCodeInput, setVoucherCodeInput] = useState({});

  // Modal 1: Create Meal Package Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planImageFile, setPlanImageFile] = useState(null);
  const [planFormData, setPlanFormData] = useState({
    plan_name: '',
    description: '',
    price: '0',
    university_id: '',
    address: '',
    city: '',
    phone_number: user?.phone_number || '',
    latitude: '',
    longitude: '',
  });

  // Modal 2: Add Food Item Modal State
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedPlanIdForFood, setSelectedPlanIdForFood] = useState(null);
  const [foodImageFile, setFoodImageFile] = useState(null);
  const [foodFormData, setFoodFormData] = useState({
    food_name: '',
    price: '',
    category: 'Breakfast',
  });

  // Withdrawal Form State
  const [withdrawData, setWithdrawData] = useState({
    bank_name: 'BOC',
    account_holder_name: '',
    account_number: '',
    branch: '',
    amount: '',
    phone_number: user?.phone_number || '',
  });

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
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch Meal Plans
      try {
        const plansRes = await API.get('/meal-plans/provider/my-plans');
        setMealPlans(plansRes.data?.data?.meal_plans || []);
      } catch (err) {
        console.warn('Could not fetch meal plans:', err);
        setMealPlans([]);
      }

      // 2. Fetch Subscribers
      try {
        const subsRes = await API.get('/subscriptions/provider');
        setSubscribers(subsRes.data?.data?.subscribers || []);
      } catch (err) {
        console.warn('Could not fetch subscribers:', err);
        setSubscribers([]);
      }

      // 3. Fetch Consumption Logs
      try {
        const logsRes = await API.get('/meal-consumption/logs');
        setLogs(logsRes.data?.data?.logs || []);
      } catch (err) {
        console.warn('Could not fetch logs:', err);
        setLogs([]);
      }

      // 4. Fetch Wallet Balance
      try {
        const walletRes = await API.get('/wallet/balance');
        setWalletBalance(walletRes.data?.data?.balance || 0);
      } catch (err) {
        console.warn('Wallet API endpoint not available:', err);
        setWalletBalance(0);
      }

      // 5. Fetch Food Orders
      try {
        const ordersRes = await API.get('/food-orders/provider');
        setOrders(ordersRes.data?.data?.orders || []);
      } catch (err) {
        console.warn('Orders API endpoint not available:', err);
        setOrders([]);
      }

      // 6. Fetch Universities List for Modal Dropdown
      try {
        const uniRes = await API.get('/accommodations/universities/list');
        setUniversities(uniRes.data?.data?.universities || []);
      } catch (err) {
        console.warn('Could not fetch universities for provider:', err);
        setUniversities([]);
      }
    } catch (err) {
      console.error('Provider Data Fetch Error:', err);
      setError('Failed to fetch kitchen records.');
    } finally {
      setLoading(false);
    }
  };

  // --- ORDER STATUS UPDATES ---
  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      await API.patch(`/food-orders/${orderId}/status`, { status: newStatus });
      fetchProviderData();
    } catch (err) {
      console.error('Order Status Update Error:', err);
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- CONFIRM ORDER VOUCHER COLLECTION ---
  const handleConfirmVoucher = async (orderId) => {
    const code = voucherCodeInput[orderId];
    if (!code || !code.trim()) {
      alert('Please enter student voucher code to confirm collection.');
      return;
    }

    setActionLoading(true);
    try {
      await API.post(`/food-orders/${orderId}/confirm-voucher`, { voucher_code: code.trim() });
      alert('✅ Food order redeemed and confirmed successfully!');
      setVoucherCodeInput({ ...voucherCodeInput, [orderId]: '' });
      fetchProviderData();
    } catch (err) {
      console.error('Confirm Voucher Error:', err);
      alert(err.response?.data?.message || 'Failed to redeem voucher code.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- CREATE NEW MEAL PACKAGE ---
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const data = new FormData();
      Object.keys(planFormData).forEach((key) => data.append(key, planFormData[key]));
      if (planImageFile) {
        data.append('image', planImageFile);
      }

      await API.post('/meal-plans', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowPlanModal(false);
      setPlanImageFile(null);
      setPlanFormData({
        plan_name: '',
        description: '',
        price: '0',
        university_id: '',
        address: '',
        city: '',
        phone_number: user?.phone_number || '',
        latitude: '',
        longitude: '',
      });
      fetchProviderData();
    } catch (err) {
      console.error('Create Plan Error:', err);
      alert(err.response?.data?.message || 'Failed to publish meal plan.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- ADD FOOD ITEM CHOICE ---
  const handleOpenFoodModal = (planId) => {
    setSelectedPlanIdForFood(planId);
    setFoodFormData({
      food_name: '',
      price: '',
      category: 'Breakfast',
    });
    setFoodImageFile(null);
    setShowFoodModal(true);
  };

  const handleAddFoodItem = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const data = new FormData();
      data.append('meal_plan_id', selectedPlanIdForFood);
      data.append('food_name', foodFormData.food_name);
      data.append('price', foodFormData.price);
      data.append('category', foodFormData.category);
      if (foodImageFile) {
        data.append('image', foodImageFile);
      }

      await API.post('/meal-plans/food-item', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowFoodModal(false);
      alert('✅ Food choice added to plan!');
      fetchProviderData();
    } catch (err) {
      console.error('Add Food Item Error:', err);
      alert(err.response?.data?.message || 'Failed to add food item.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- DELETE FOOD ITEM ---
  const handleDeleteFoodItem = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;

    setActionLoading(true);
    try {
      await API.delete(`/meal-plans/food-item/${foodId}`);
      fetchProviderData();
    } catch (err) {
      console.error('Delete Food Item Error:', err);
      alert(err.response?.data?.message || 'Failed to delete food item.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- DELETE MEAL PACKAGE ---
  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal plan?')) return;

    setActionLoading(true);
    try {
      await API.delete(`/meal-plans/${id}`);
      fetchProviderData();
    } catch (err) {
      console.error('Delete Plan Error:', err);
      alert(err.response?.data?.message || 'Failed to delete plan.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- BANK WITHDRAWAL SUBMISSION ---
  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (parseFloat(withdrawData.amount) > parseFloat(walletBalance)) {
      alert('Withdrawal amount exceeds current wallet balance!');
      return;
    }

    setActionLoading(true);
    try {
      await API.post('/wallet/withdraw', withdrawData);
      alert('✅ Withdrawal request submitted successfully!');
      setWithdrawData({
        bank_name: 'BOC',
        account_holder_name: '',
        account_number: '',
        branch: '',
        amount: '',
        phone_number: user?.phone_number || '',
      });
      fetchProviderData();
    } catch (err) {
      console.error('Withdrawal Error:', err);
      alert(err.response?.data?.message || 'Withdrawal request failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'Ready To Pick up').length;

  return (
    <div className="provider-dashboard-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="provider-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Utensils size={20} />
          </div>
          <div className="sidebar-brand-text">
            <h3>UniStay Catering</h3>
            <span className="role-indicator">Meal Provider Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Overview</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} />
            <span>Orders & Redemptions</span>
            {pendingOrdersCount > 0 && <span className="nav-badge count-alert">{pendingOrdersCount}</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            <Utensils size={18} />
            <span>Meal Packages</span>
            {mealPlans.length > 0 && <span className="nav-badge">{mealPlans.length}</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => handleTabChange('wallet')}
          >
            <Wallet size={18} />
            <span>Revenue & Payouts</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <User size={18} />
            <span>Kitchen Profile</span>
          </button>
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="sidebar-footer">
          <div 
            className="user-avatar-mini"
            onClick={() => handleTabChange('profile')}
            title="My Profile"
          >
            {user?.profile_image ? (
              <img src={user.profile_image} alt={user.first_name} className="user-avatar-mini-img" />
            ) : (
              <User size={16} />
            )}
          </div>
          <div className="user-details-mini" onClick={() => handleTabChange('profile')}>
            <span className="user-name">{user?.business_name || `${user?.first_name} ${user?.last_name}`}</span>
            <span className={`user-status-pill ${user?.verification_status === 'verified' ? 'verified' : 'pending'}`}>
              {user?.verification_status?.toUpperCase() || 'PROVIDER'}
            </span>
          </div>
          <button className="logout-icon-btn" onClick={logout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="provider-main-content">
        {/* HEADER TOPBAR */}
        <header className="provider-topbar">
          <div className="topbar-title">
            <div className="welcome-tag provider-welcome-tag">
              <Utensils size={14} />
              <span>Campus Catering Partner</span>
            </div>
            <h1>{user?.business_name || 'Meal Provider Portal'} 🍱</h1>
            <p>Manage dining packages, fulfill daily food orders, redeem vouchers, and process wallet payouts.</p>
          </div>

          <div className="topbar-actions">
            <button onClick={fetchProviderData} className="btn btn-outline btn-refresh" disabled={loading}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowPlanModal(true)}
              className="btn btn-primary btn-add-package"
              disabled={user?.verification_status !== 'verified'}
              title={user?.verification_status !== 'verified' ? 'Account verification required before publishing packages' : 'Create new meal package'}
            >
              <Plus size={18} />
              <span>Create Meal Package</span>
            </button>
            <button 
              className="topbar-avatar-btn"
              onClick={() => handleTabChange('profile')}
              title="My Profile & Settings"
            >
              {user?.profile_image ? (
                <img src={user.profile_image} alt={user.first_name} className="topbar-avatar-img" />
              ) : (
                <User size={18} />
              )}
            </button>
          </div>
        </header>

        {user?.verification_status !== 'verified' && (
          <div className="verification-warning-banner">
            <Clock size={20} className="warning-icon" />
            <div className="warning-text">
              <strong>Business Verification Pending:</strong> Your catering kitchen profile is awaiting administrator verification. Payouts and new package publications unlock automatically upon approval.
            </div>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="provider-loading-state">
            <div className="spinner"></div>
            <p>Loading catering records and orders...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="tab-pane">
                {/* METRICS STAT CARDS */}
                <div className="provider-stats-grid">
                  <div className="provider-stat-card" onClick={() => handleTabChange('wallet')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon icon-emerald">
                      <Wallet size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">LKR {parseFloat(walletBalance || 0).toLocaleString()}</span>
                      <span className="stat-label">Wallet Balance</span>
                      <span className="stat-sub">Available for bank payout</span>
                    </div>
                  </div>

                  <div className="provider-stat-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon icon-orange">
                      <ShoppingBag size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{pendingOrdersCount}</span>
                      <span className="stat-label">Pending Orders</span>
                      <span className="stat-sub">Awaiting pickup/collection</span>
                    </div>
                  </div>

                  <div className="provider-stat-card" onClick={() => setActiveTab('packages')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon icon-blue">
                      <Utensils size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{mealPlans.length}</span>
                      <span className="stat-label">Meal Packages</span>
                      <span className="stat-sub">Published catering plans</span>
                    </div>
                  </div>
                </div>

                {/* OVERVIEW SPLIT PREVIEWS */}
                <div className="overview-split-grid">
                  {/* RECENT ORDERS PREVIEW */}
                  <div className="preview-card">
                    <div className="preview-header">
                      <div>
                        <h3>Recent Food Orders</h3>
                        <p className="card-sub-desc">Student breakfast, lunch & dinner choices</p>
                      </div>
                      <button onClick={() => setActiveTab('orders')} className="btn-link">
                        View All <ChevronRight size={14} />
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="card-empty-state">
                        <ShoppingBag size={36} className="empty-state-icon" />
                        <p>No orders placed yet.</p>
                      </div>
                    ) : (
                      <div className="preview-list">
                        {orders.slice(0, 4).map((order) => (
                          <div key={order.order_id} className="mini-item-row">
                            <div className="mini-info">
                              <h4>{order.plan_name}</h4>
                              <p className="item-sub">Student: <strong>{order.first_name} {order.last_name}</strong> • LKR {parseFloat(order.total_amount || 0).toLocaleString()}</p>
                            </div>
                            <span className={`status-pill pill-${(order.status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
                              {order.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ACTIVE MEAL PACKAGES PREVIEW */}
                  <div className="preview-card">
                    <div className="preview-header">
                      <div>
                        <h3>Published Packages</h3>
                        <p className="card-sub-desc">Live catering plans near campus</p>
                      </div>
                      <button onClick={() => setActiveTab('packages')} className="btn-link">
                        View All <ChevronRight size={14} />
                      </button>
                    </div>

                    {mealPlans.length === 0 ? (
                      <div className="card-empty-state">
                        <Utensils size={36} className="empty-state-icon" />
                        <p>No catering packages published yet.</p>
                      </div>
                    ) : (
                      <div className="preview-list">
                        {mealPlans.slice(0, 4).map((plan) => (
                          <div key={plan.meal_plan_id} className="mini-item-row">
                            <div className="mini-info">
                              <h4>{plan.plan_name}</h4>
                              <p className="item-sub">📍 {plan.city || 'Campus Area'}</p>
                            </div>
                            <button onClick={() => handleOpenFoodModal(plan.meal_plan_id)} className="btn btn-outline btn-sm">
                              + Add Item
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="tab-pane">
                <ProfileSection />
              </div>
            )}

            {/* ORDERS & REDEMPTIONS TAB */}
            {activeTab === 'orders' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div>
                    <h2>Food Orders & Collection Confirmations</h2>
                    <p className="pane-subtitle">Fulfill student meal choices and confirm voucher collection codes</p>
                  </div>
                  <span className="count-tag provider-count-tag">{orders.length} Total Orders</span>
                </div>

                {orders.length === 0 ? (
                  <div className="modern-empty-state">
                    <ShoppingBag size={44} className="empty-state-icon" />
                    <h3>No Incoming Orders</h3>
                    <p>When student subscribers place orders against your meal plans, they will show up here for collection.</p>
                  </div>
                ) : (
                  <div className="orders-flex-list">
                    {orders.map((order) => (
                      <div key={order.order_id} className="modern-order-card">
                        <div className="order-main-info">
                          <h3>{order.plan_name}</h3>
                          <p className="student-detail">
                            Student: <strong>{order.first_name} {order.last_name}</strong>
                          </p>
                          <div className="contact-meta">
                            <span><Phone size={13} /> {order.phone_number || 'No phone'}</span>
                          </div>
                          
                          {/* Itemized Food Details */}
                          <div className="order-items-container">
                            <span className="items-label">Ordered Food Items:</span>
                            <div className="food-items-stack">
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item, idx) => (
                                  <div key={idx} className="itemized-chip">
                                    <span className="chip-cat">{item.category}</span>
                                    <strong className="chip-name">{item.food_name}</strong>
                                    <span className="chip-qty">Qty: {item.quantity}</span>
                                    <span className="chip-price">@ LKR {parseFloat(item.unit_price).toLocaleString()}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-dim-sub">Standard Menu Item</span>
                              )}
                            </div>
                          </div>

                          <p className="price-meta">Total Amount: <strong>LKR {parseFloat(order.total_amount || 0).toLocaleString()}</strong></p>
                        </div>

                        <div className="order-action-col">
                          <span className={`status-pill pill-${(order.status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
                            {order.status}
                          </span>

                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(order.order_id, 'Ready To Pick up')}
                              className="btn btn-primary btn-sm btn-ready"
                              disabled={actionLoading}
                            >
                              Mark as Ready To Pick up
                            </button>
                          )}

                          {order.status === 'Ready To Pick up' && (
                            <div className="voucher-confirm-box">
                              <input
                                type="text"
                                placeholder="Student Voucher Code"
                                value={voucherCodeInput[order.order_id] || ''}
                                onChange={(e) => setVoucherCodeInput({
                                  ...voucherCodeInput,
                                  [order.order_id]: e.target.value
                                })}
                              />
                              <button
                                onClick={() => handleConfirmVoucher(order.order_id)}
                                className="btn btn-approve"
                                disabled={actionLoading}
                              >
                                <CheckCircle size={14} /> Confirm Collection
                              </button>
                            </div>
                          )}

                          {order.status === 'Confirmed' && (
                            <span className="confirmed-tag">
                              <CheckCircle size={14} /> Voucher Deducted ({order.voucher_code_used})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MEAL PACKAGES TAB */}
            {activeTab === 'packages' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div>
                    <h2>Catering Packages Management</h2>
                    <p className="pane-subtitle">Manage daily meal packages, configure itemized menus, and set pricing</p>
                  </div>
                  <span className="count-tag provider-count-tag">{mealPlans.length} Published</span>
                </div>

                {mealPlans.length === 0 ? (
                  <div className="modern-empty-state">
                    <Utensils size={44} className="empty-state-icon" />
                    <h3>No Meal Packages Published</h3>
                    <p>Click "Create Meal Package" above to publish your catering plans for campus students.</p>
                    <button 
                      onClick={() => setShowPlanModal(true)} 
                      className="btn btn-primary"
                      style={{ marginTop: '1rem' }}
                      disabled={user?.verification_status !== 'verified'}
                    >
                      <Plus size={16} /> Create Meal Package
                    </button>
                  </div>
                ) : (
                  <div className="provider-packages-grid">
                    {mealPlans.map((plan) => (
                      <div key={plan.meal_plan_id} className="modern-package-card">
                        {plan.image_url && (
                          <div className="package-card-media">
                            <img src={plan.image_url} alt={plan.plan_name} />
                          </div>
                        )}
                        <div className="card-body">
                          <h3>{plan.plan_name}</h3>
                          <p className="location-text">📍 {plan.city || 'Near Campus'}</p>
                          <p className="description-text">{plan.description || 'No detailed description provided.'}</p>
                          
                          {/* Categories and Food Items */}
                          <div className="package-food-items-section">
                            <span className="section-label-sub">
                              Food Items in Package:
                            </span>
                            {plan.food_items && plan.food_items.length > 0 ? (
                              <div className="package-food-list">
                                {plan.food_items.map((food) => (
                                  <div key={food.food_id} className="package-food-row">
                                    <div className="food-info-left">
                                      <span className="chip-cat">{food.category}</span>
                                      <strong>{food.food_name}</strong>
                                      <span className="food-price-text">LKR {parseFloat(food.price).toLocaleString()}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFoodItem(food.food_id);
                                      }}
                                      className="btn-delete-mini"
                                      title="Delete this food item"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="no-items-text">No food items added yet. Click "+ Add Food" below.</span>
                            )}
                          </div>

                          <div className="card-actions-row">
                            <button onClick={() => handleOpenFoodModal(plan.meal_plan_id)} className="btn-card-outline">
                              <Plus size={14} /> Add Food
                            </button>
                            <button onClick={() => handleDeletePlan(plan.meal_plan_id)} className="btn-card-danger" disabled={actionLoading}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REVENUE & PAYOUTS TAB */}
            {activeTab === 'wallet' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div>
                    <h2>Revenue Wallet & Bank Payout Requests</h2>
                    <p className="pane-subtitle">Monitor collected funds from voucher redemptions and request direct bank payouts</p>
                  </div>
                </div>

                <div className="wallet-grid">
                  <div className="wallet-card-featured">
                    <span className="wallet-title">Available Earnings Balance</span>
                    <h2 className="wallet-balance">LKR {parseFloat(walletBalance || 0).toLocaleString()}</h2>
                    <p className="wallet-sub">Funds credited automatically upon order voucher collection confirmation.</p>
                  </div>

                  <div className="withdraw-form-card">
                    <div className="withdraw-header">
                      <Landmark size={20} className="landmark-icon" />
                      <div>
                        <h3>Request Bank Payout</h3>
                        <p>Withdraw earnings to your registered Sri Lankan bank account</p>
                      </div>
                    </div>
                    <form onSubmit={handleWithdraw} className="withdraw-grid-form">
                      <div className="form-group">
                        <label>Select Bank</label>
                        <select
                          value={withdrawData.bank_name}
                          onChange={(e) => setWithdrawData({ ...withdrawData, bank_name: e.target.value })}
                          required
                        >
                          <option value="" disabled>-- Select Bank --</option>
                          {['HNB', 'NSB', 'BOC', 'NDB', 'Commercial Bank', 'Peoples bank', 'Sampath Bank'].map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Account Holder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. K. A. Fernando"
                          value={withdrawData.account_holder_name}
                          onChange={(e) => setWithdrawData({ ...withdrawData, account_holder_name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Account Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 8001234567"
                          value={withdrawData.account_number}
                          onChange={(e) => setWithdrawData({ ...withdrawData, account_number: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Branch Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Moratuwa Branch"
                          value={withdrawData.branch}
                          onChange={(e) => setWithdrawData({ ...withdrawData, branch: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Withdrawal Amount (LKR)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="e.g. 10000"
                          value={withdrawData.amount}
                          onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Contact Phone Number</label>
                        <input
                          type="text"
                          required
                          value={withdrawData.phone_number}
                          onChange={(e) => setWithdrawData({ ...withdrawData, phone_number: e.target.value })}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary full-width btn-withdraw-submit"
                        disabled={actionLoading || walletBalance <= 0}
                      >
                        <Send size={16} /> Submit Withdrawal Request
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL 1: CREATE MEAL PACKAGE */}
      {showPlanModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-lg modern-provider-modal">
            <div className="modal-header provider-modal-header">
              <div className="modal-header-icon-title">
                <div className="modal-title-icon-box">
                  <Utensils size={22} />
                </div>
                <div>
                  <h2>Create New Meal Package</h2>
                  <p className="modal-sub-desc">Publish a student dining plan with address and campus location</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowPlanModal(false)}><X size={20} /></button>
            </div>

            <div className="modal-scrollable-content">
              <form onSubmit={handleCreatePlan} className="grid-form provider-modal-form">
                {/* SECTION 1: PACKAGE OVERVIEW */}
                <div className="modal-form-section-title full-width">
                  <Sparkles size={16} />
                  <span>Package Overview &amp; Details</span>
                </div>

                <div className="form-group full-width">
                  <label><Utensils size={14} /> Package Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium Campus Student Combo"
                    value={planFormData.plan_name}
                    onChange={(e) => setPlanFormData({ ...planFormData, plan_name: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label><FileText size={14} /> Description &amp; Meal Highlights</label>
                  <textarea
                    rows="3"
                    placeholder="Details regarding menu variety, dietary choices, daily schedules, portion sizes..."
                    value={planFormData.description}
                    onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label><ImageIcon size={14} /> Meal Package Cover Image</label>
                  <div className="modern-file-dropzone">
                    {planImageFile ? (
                      <div className="file-preview-wrap">
                        <img 
                          src={URL.createObjectURL(planImageFile)} 
                          alt="Cover Preview" 
                          className="file-preview-img" 
                        />
                        <div className="file-preview-meta">
                          <strong>{planImageFile.name}</strong>
                          <span>{(planImageFile.size / 1024).toFixed(1)} KB</span>
                          <button 
                            type="button" 
                            className="btn-remove-file"
                            onClick={() => setPlanImageFile(null)}
                          >
                            <X size={14} /> Remove Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="file-dropzone-label">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden-file-input"
                          onChange={(e) => setPlanImageFile(e.target.files?.[0] || null)}
                        />
                        <div className="dropzone-icon-circle">
                          <UploadCloud size={24} />
                        </div>
                        <div className="dropzone-text">
                          <strong>Click to upload package cover image</strong>
                          <span>Supports JPG, PNG, WEBP (Max 5MB)</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* SECTION 2: CAMPUS & LOCATION */}
                <div className="modal-form-section-title full-width">
                  <MapPin size={16} />
                  <span>Campus Target &amp; Kitchen Location</span>
                </div>

                <div className="form-group">
                  <label><GraduationCap size={14} /> Target Campus University</label>
                  <select
                    required
                    value={planFormData.university_id}
                    onChange={(e) => setPlanFormData({ ...planFormData, university_id: e.target.value })}
                    className="styled-modal-select"
                  >
                    <option value="">-- Select Nearest University --</option>
                    {universities.map((u) => (
                      <option key={u.university_id} value={u.university_id}>
                        {u.name} ({u.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label><MapPin size={14} /> Kitchen / Outlet Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 88 Station Road"
                    value={planFormData.address}
                    onChange={(e) => setPlanFormData({ ...planFormData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label><Building2 size={14} /> City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Moratuwa"
                    value={planFormData.city}
                    onChange={(e) => setPlanFormData({ ...planFormData, city: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label><Phone size={14} /> Hotline Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0771234567"
                    value={planFormData.phone_number}
                    onChange={(e) => setPlanFormData({ ...planFormData, phone_number: e.target.value })}
                  />
                </div>

                {/* SECTION 3: SPATIAL COORDINATES */}
                <div className="modal-form-section-title full-width">
                  <Navigation size={16} />
                  <span>GPS Coordinates for 5km Commute Radius</span>
                </div>

                <div className="form-group">
                  <label><Navigation size={14} /> Latitude Coordinate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6.7951"
                    value={planFormData.latitude}
                    onChange={(e) => setPlanFormData({ ...planFormData, latitude: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label><Navigation size={14} /> Longitude Coordinate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 79.9009"
                    value={planFormData.longitude}
                    onChange={(e) => setPlanFormData({ ...planFormData, longitude: e.target.value })}
                  />
                </div>

                <div className="modal-actions full-width provider-modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowPlanModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-provider-submit" disabled={actionLoading}>
                    <Utensils size={16} />
                    <span>{actionLoading ? 'Publishing...' : 'Publish Package'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD FOOD ITEM CHOICE */}
      {showFoodModal && (
        <div className="modal-overlay">
          <div className="modal-card modern-provider-modal food-item-modal" style={{ background: '#ffffff' }}>
            <div className="modal-header provider-modal-header">
              <div className="modal-header-icon-title">
                <div className="modal-title-icon-box">
                  <Plus size={22} />
                </div>
                <div>
                  <h2>Add Food Item Choice</h2>
                  <p className="modal-sub-desc">Add a dish to your menu under Breakfast, Lunch, or Dinner</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowFoodModal(false)}><X size={20} /></button>
            </div>

            <div className="modal-scrollable-content">
              <form onSubmit={handleAddFoodItem} className="grid-form provider-modal-form" style={{ padding: '1.75rem 2rem', background: '#ffffff' }}>
                {/* Category Selector with Quick Chips */}
                <div className="form-group full-width">
                  <label>Meal Category</label>
                  <div className="category-pill-selector">
                    {[
                      { val: 'Breakfast', label: 'Breakfast', icon: Sun },
                      { val: 'Lunch', label: 'Lunch', icon: UtensilsCrossed },
                      { val: 'Dinner', label: 'Dinner', icon: Moon },
                    ].map(({ val, label, icon: Icon }) => (
                      <button
                        key={val}
                        type="button"
                        className={`category-pill-btn ${foodFormData.category === val ? 'active' : ''}`}
                        onClick={() => setFoodFormData({ ...foodFormData, category: val })}
                      >
                        <Icon size={16} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label><Utensils size={14} /> Food Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. String Hoppers with Kiri Hodi & Pol Sambol"
                    value={foodFormData.food_name}
                    onChange={(e) => setFoodFormData({ ...foodFormData, food_name: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label><Tag size={14} /> Item Price (LKR)</label>
                  <div className="price-input-wrapper">
                    <span className="price-currency-prefix">LKR</span>
                    <input
                      type="number"
                      required
                      placeholder="250"
                      value={foodFormData.price}
                      onChange={(e) => setFoodFormData({ ...foodFormData, price: e.target.value })}
                      className="price-input-field"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label><ImageIcon size={14} /> Food Photo</label>
                  <div className="modern-file-dropzone">
                    {foodImageFile ? (
                      <div className="file-preview-wrap">
                        <img 
                          src={URL.createObjectURL(foodImageFile)} 
                          alt="Food Preview" 
                          className="file-preview-img" 
                        />
                        <div className="file-preview-meta">
                          <strong>{foodImageFile.name}</strong>
                          <span>{(foodImageFile.size / 1024).toFixed(1)} KB</span>
                          <button 
                            type="button" 
                            className="btn-remove-file"
                            onClick={() => setFoodImageFile(null)}
                          >
                            <X size={14} /> Remove Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="file-dropzone-label">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden-file-input"
                          onChange={(e) => setFoodImageFile(e.target.files?.[0] || null)}
                        />
                        <div className="dropzone-icon-circle">
                          <UploadCloud size={24} />
                        </div>
                        <div className="dropzone-text">
                          <strong>Click to upload dish photo</strong>
                          <span>PNG, JPG or WEBP (Max 5MB)</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="modal-actions full-width provider-modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowFoodModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-provider-submit" disabled={actionLoading}>
                    <Plus size={16} />
                    <span>{actionLoading ? 'Saving...' : 'Save Food Item'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
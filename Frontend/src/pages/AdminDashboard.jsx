import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import ProfileSection from '../components/ProfileSection';
import { 
  Users, Home, Utensils, Shield, CheckCircle, XCircle, 
  AlertCircle, RefreshCw, Lock, Unlock, BarChart2, Building2,
  LayoutDashboard, UserCheck, FolderKanban, Search, ChevronRight,
  User, MessageSquare, Send, X, LogOut, MapPin, Plus, GraduationCap,
  Info, Navigation
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation Sidebar Tab State ('overview' | 'verifications' | 'directory' | 'universities' | 'inquiries' | 'profile')
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // Core Data States
  const [reports, setReports] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState({ owners: [], providers: [] });
  const [usersDirectory, setUsersDirectory] = useState({ students: [], owners: [], providers: [] });
  const [universitiesList, setUniversitiesList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Tab State for User Directory Sub-tabs
  const [activeDirectoryTab, setActiveDirectoryTab] = useState('owners'); // 'students' | 'owners' | 'providers'
  const [searchQuery, setSearchQuery] = useState('');

  // Support Inquiries States
  const [inquiries, setInquiries] = useState([]);
  const [inquiryFilter, setInquiryFilter] = useState('all'); // 'all' | 'pending' | 'responded'
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [responseLoading, setResponseLoading] = useState(false);

  // University Modal State
  const [showUniModal, setShowUniModal] = useState(false);
  const [uniFormData, setUniFormData] = useState({
    name: '',
    city: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const [reportsRes, pendingRes, usersRes, inquiriesRes, uniRes] = await Promise.all([
        API.get('/admin/reports/summary').catch(() => ({ data: { data: { summary: null } } })),
        API.get('/admin/verifications/pending').catch(() => ({ data: { data: { pending_property_owners: [], pending_meal_providers: [] } } })),
        API.get('/admin/users').catch(() => ({ data: { data: { students: [], property_owners: [], meal_providers: [] } } })),
        API.get('/inquiries').catch(() => ({ data: { data: { inquiries: [] } } })),
        API.get('/admin/universities').catch(() => ({ data: { data: { universities: [] } } }))
      ]);

      setReports(reportsRes.data?.data?.summary || null);
      setPendingVerifications({
        owners: pendingRes.data?.data?.pending_property_owners || [],
        providers: pendingRes.data?.data?.pending_meal_providers || []
      });
      setUsersDirectory({
        students: usersRes.data?.data?.students || [],
        owners: usersRes.data?.data?.property_owners || [],
        providers: usersRes.data?.data?.meal_providers || []
      });
      setInquiries(inquiriesRes.data?.data?.inquiries || []);
      setUniversitiesList(uniRes.data?.data?.universities || []);
    } catch (err) {
      console.error('Admin Load Error:', err);
      setMsg({ type: 'error', text: 'Failed to load administrative console data.' });
    } finally {
      setLoading(false);
    }
  };

  // 1. Verify / Reject Pending Accounts
  const handleVerificationAction = async (userType, id, status) => {
    setActionLoading(true);
    try {
      await API.patch(`/admin/verify/${userType}/${id}`, { status });
      setMsg({ 
        type: 'success', 
        text: `Account ID #${id} successfully marked as ${status.toUpperCase()}.` 
      });
      await loadAdminData();
    } catch (err) {
      console.error('Verify Action Error:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Verification update failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Suspend / Activate Users
  const handleToggleUserStatus = async (role, id, currentActiveState) => {
    setActionLoading(true);
    try {
      const targetRole = role === 'property_owner' ? 'owner' : role === 'meal_provider' ? 'provider' : 'student';
      await API.patch(`/admin/users/status/${targetRole}/${id}`, { 
        is_active: !currentActiveState 
      });

      setMsg({
        type: 'success',
        text: `User ID #${id} status updated to ${!currentActiveState ? 'ACTIVE' : 'SUSPENDED'}.`
      });
      await loadAdminData();
    } catch (err) {
      console.error('Toggle Status Error:', err);
      setMsg({ type: 'error', text: 'Failed to update user active status.' });
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Add University Coordinates
  const handleAddUniversity = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.post('/admin/universities', uniFormData);
      setMsg({ type: 'success', text: `University "${uniFormData.name}" added successfully with campus coordinates!` });
      setShowUniModal(false);
      setUniFormData({ name: '', city: '', latitude: '', longitude: '' });
      await loadAdminData();
    } catch (err) {
      console.error('Add University Error:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add university.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenResponseModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAdminResponseText(inquiry.admin_response || '');
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!adminResponseText.trim() || !selectedInquiry) return;
    setResponseLoading(true);
    try {
      await API.patch(`/inquiries/${selectedInquiry.inquiry_id}/respond`, {
        admin_response: adminResponseText.trim()
      });
      setMsg({ 
        type: 'success', 
        text: `Response dispatched for Inquiry #${selectedInquiry.inquiry_id}. User notified in portal.` 
      });
      setSelectedInquiry(null);
      setAdminResponseText('');
      await loadAdminData();
    } catch (err) {
      console.error('Inquiry Response Error:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit response.' });
    } finally {
      setResponseLoading(false);
    }
  };

  const pendingCount = pendingVerifications.owners.length + pendingVerifications.providers.length;
  const pendingInquiriesCount = inquiries.filter((i) => i.status === 'pending').length;
  const filteredInquiries = inquiries.filter((i) => {
    if (inquiryFilter === 'pending') return i.status === 'pending';
    if (inquiryFilter === 'responded') return i.status === 'responded';
    return true;
  });

  return (
    <div className="admin-dashboard-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Shield size={20} />
          </div>
          <div className="sidebar-brand-text">
            <h3>UniStay Admin</h3>
            <span className="role-indicator">Central Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Console Overview</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'verifications' ? 'active' : ''}`}
            onClick={() => handleTabChange('verifications')}
          >
            <UserCheck size={18} />
            <span>Verification Queue</span>
            {pendingCount > 0 && <span className="nav-badge count-alert">{pendingCount}</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => handleTabChange('directory')}
          >
            <FolderKanban size={18} />
            <span>User Directory</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'universities' ? 'active' : ''}`}
            onClick={() => handleTabChange('universities')}
          >
            <GraduationCap size={18} />
            <span>Campus Coordinates</span>
            {universitiesList.length > 0 && <span className="nav-badge">{universitiesList.length}</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => handleTabChange('inquiries')}
          >
            <MessageSquare size={18} />
            <span>Inquiries & Support</span>
            {pendingInquiriesCount > 0 && (
              <span className="nav-badge count-alert">{pendingInquiriesCount}</span>
            )}
          </button>

          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <User size={18} />
            <span>My Profile</span>
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
              <img src={user.profile_image} alt={user.first_name || 'Admin'} className="user-avatar-mini-img" />
            ) : (
              <User size={16} />
            )}
          </div>
          <div className="user-details-mini" onClick={() => handleTabChange('profile')}>
            <span className="user-name">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'System Administrator'}</span>
            <span className="user-status-pill admin-badge">{user?.access_level?.toUpperCase() || 'SUPERADMIN'}</span>
          </div>
          <button className="logout-icon-btn" onClick={logout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="admin-main-content">
        {/* HEADER TOPBAR */}
        <header className="admin-topbar">
          <div className="topbar-title">
            <div className="welcome-tag admin-welcome-tag">
              <Shield size={14} />
              <span>Platform Authority Console</span>
            </div>
            <h1>Administration Console 🛡️</h1>
            <p>Verify service providers, enforce access control policies, manage campuses, and resolve inquiries.</p>
          </div>

          <div className="topbar-actions">
            <button onClick={loadAdminData} className="btn btn-outline btn-refresh" disabled={loading}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              <span>Refresh Metrics</span>
            </button>
            <button 
              onClick={() => handleTabChange('profile')} 
              className={`btn btn-outline ${activeTab === 'profile' ? 'active' : ''}`}
              title="Admin Profile & Security"
            >
              {user?.profile_image ? (
                <img src={user.profile_image} alt="Admin" className="admin-avatar-small" />
              ) : (
                <User size={16} />
              )}
              <span>My Profile</span>
            </button>
          </div>
        </header>

        {msg.text && (
          <div className={`status-banner ${msg.type}`}>
            {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{msg.text}</span>
          </div>
        )}

        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner"></div>
            <p>Fetching live administrative metrics and records...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="tab-pane">
                {/* LIVE METRICS CARDS */}
                <div className="admin-stats-grid">
                  <div className="admin-stat-card" onClick={() => { handleTabChange('directory'); setActiveDirectoryTab('students'); }} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon icon-blue">
                      <Users size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{reports?.total_students || 0}</span>
                      <span className="stat-label">Registered Students</span>
                      <span className="stat-sub">Active Student Accounts</span>
                    </div>
                  </div>

                  <div className="admin-stat-card" onClick={() => { handleTabChange('directory'); setActiveDirectoryTab('owners'); }} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon icon-teal">
                      <Home size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{reports?.total_property_owners || 0}</span>
                      <span className="stat-label">Property Owners</span>
                      <span className="stat-sub">Accommodation Managers</span>
                    </div>
                  </div>

                  <div className="admin-stat-card" onClick={() => { handleTabChange('directory'); setActiveDirectoryTab('providers'); }} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon icon-orange">
                      <Utensils size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{reports?.total_meal_providers || 0}</span>
                      <span className="stat-label">Meal Providers</span>
                      <span className="stat-sub">Catering Partners</span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="stat-icon icon-indigo">
                      <Building2 size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{reports?.total_accommodations_listed || 0}</span>
                      <span className="stat-label">Active Accommodations</span>
                      <span className="stat-sub">Published Boarding Listings</span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="stat-icon icon-emerald">
                      <BarChart2 size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{reports?.total_meals_served || 0}</span>
                      <span className="stat-label">Meals Served</span>
                      <span className="stat-sub">Total Meal Pass Redemptions</span>
                    </div>
                  </div>
                </div>

                {/* OVERVIEW SPLIT PREVIEWS */}
                <div className="overview-split-grid">
                  {/* PENDING VERIFICATION PREVIEW */}
                  <div className="preview-card">
                    <div className="preview-header">
                      <div>
                        <h3>Pending Verification Queue</h3>
                        <p className="card-sub-desc">Owners and kitchens waiting for operational approval</p>
                      </div>
                      <button onClick={() => handleTabChange('verifications')} className="btn-link">
                        Review All ({pendingCount}) <ChevronRight size={14} />
                      </button>
                    </div>

                    {pendingCount === 0 ? (
                      <div className="card-empty-state">
                        <CheckCircle size={36} className="empty-state-icon" style={{ color: '#16a34a' }} />
                        <p>All provider and owner accounts are currently verified!</p>
                      </div>
                    ) : (
                      <div className="preview-list">
                        {pendingVerifications.owners.slice(0, 2).map((owner) => (
                          <div key={`preview-owner-${owner.id}`} className="mini-item-row">
                            <div className="mini-info">
                              <h4>{owner.first_name} {owner.last_name}</h4>
                              <p className="item-sub">Property Host • 📍 {owner.city}</p>
                            </div>
                            <span className="badge badge-owner"><Home size={12} /> Owner</span>
                          </div>
                        ))}

                        {pendingVerifications.providers.slice(0, 2).map((provider) => (
                          <div key={`preview-provider-${provider.id}`} className="mini-item-row">
                            <div className="mini-info">
                              <h4>{provider.business_name}</h4>
                              <p className="item-sub">Meal Provider • 📍 {provider.city}</p>
                            </div>
                            <span className="badge badge-provider"><Utensils size={12} /> Provider</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* USER DIRECTORY PREVIEW */}
                  <div className="preview-card">
                    <div className="preview-header">
                      <div>
                        <h3>System Accounts Directory</h3>
                        <p className="card-sub-desc">Quick jump into role directories</p>
                      </div>
                      <button onClick={() => handleTabChange('directory')} className="btn-link">
                        Manage Directory <ChevronRight size={14} />
                      </button>
                    </div>

                    <div className="preview-list">
                      <div className="mini-item-row" onClick={() => { handleTabChange('directory'); setActiveDirectoryTab('owners'); }} style={{ cursor: 'pointer' }}>
                        <div className="mini-info">
                          <h4>Property Owners Directory</h4>
                          <p className="item-sub">{usersDirectory.owners.length} registered host profiles</p>
                        </div>
                        <button className="btn btn-outline btn-sm">
                          View
                        </button>
                      </div>

                      <div className="mini-item-row" onClick={() => { handleTabChange('directory'); setActiveDirectoryTab('providers'); }} style={{ cursor: 'pointer' }}>
                        <div className="mini-info">
                          <h4>Meal Providers Directory</h4>
                          <p className="item-sub">{usersDirectory.providers.length} registered catering kitchens</p>
                        </div>
                        <button className="btn btn-outline btn-sm">
                          View
                        </button>
                      </div>

                      <div className="mini-item-row" onClick={() => { handleTabChange('directory'); setActiveDirectoryTab('students'); }} style={{ cursor: 'pointer' }}>
                        <div className="mini-info">
                          <h4>Students Directory</h4>
                          <p className="item-sub">{usersDirectory.students.length} registered undergraduate accounts</p>
                        </div>
                        <button className="btn btn-outline btn-sm">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VERIFICATION QUEUE TAB */}
            {activeTab === 'verifications' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div>
                    <h2>Pending Verification Queue</h2>
                    <p className="pane-subtitle">Inspect identity and business background before granting listing privileges</p>
                  </div>
                  <span className="count-tag admin-count-tag">{pendingCount} Pending Approval</span>
                </div>

                {pendingCount === 0 ? (
                  <div className="modern-empty-state">
                    <CheckCircle size={44} className="empty-state-icon" style={{ color: '#16a34a' }} />
                    <h3>Queue Empty</h3>
                    <p>All provider and owner accounts are currently verified and approved for operation.</p>
                  </div>
                ) : (
                  <div className="verification-grid">
                    {/* Pending Owners */}
                    {pendingVerifications.owners.map((owner) => (
                      <div key={`owner-${owner.id}`} className="modern-verification-card">
                        <div className="card-top">
                          <span className="badge badge-owner"><Home size={12} /> Property Owner</span>
                          <span className="date-tag">{new Date(owner.registration_date).toLocaleDateString()}</span>
                        </div>

                        <div className="applicant-details">
                          <h3>{owner.first_name} {owner.last_name}</h3>
                          <p>📧 {owner.email}</p>
                          <p>📞 {owner.phone_number}</p>
                          <p>📍 {owner.street}, {owner.city}</p>
                        </div>

                        <div className="card-actions">
                          <button
                            onClick={() => handleVerificationAction('owner', owner.id, 'rejected')}
                            className="btn btn-danger btn-sm"
                            disabled={actionLoading}
                          >
                            <XCircle size={15} /> Reject
                          </button>
                          <button
                            onClick={() => handleVerificationAction('owner', owner.id, 'verified')}
                            className="btn btn-primary btn-sm btn-verify-action"
                            disabled={actionLoading}
                          >
                            <CheckCircle size={15} /> Verify Owner
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Pending Providers */}
                    {pendingVerifications.providers.map((provider) => (
                      <div key={`provider-${provider.id}`} className="modern-verification-card">
                        <div className="card-top">
                          <span className="badge badge-provider"><Utensils size={12} /> Meal Provider</span>
                          <span className="date-tag">{new Date(provider.registration_date).toLocaleDateString()}</span>
                        </div>

                        <div className="applicant-details">
                          <h3>{provider.business_name}</h3>
                          <p>Contact: <strong>{provider.first_name} {provider.last_name}</strong></p>
                          <p>📧 {provider.email}</p>
                          <p>📞 {provider.phone_number}</p>
                          <p>📍 {provider.street}, {provider.city}</p>
                        </div>

                        <div className="card-actions">
                          <button
                            onClick={() => handleVerificationAction('provider', provider.id, 'rejected')}
                            className="btn btn-danger btn-sm"
                            disabled={actionLoading}
                          >
                            <XCircle size={15} /> Reject
                          </button>
                          <button
                            onClick={() => handleVerificationAction('provider', provider.id, 'verified')}
                            className="btn btn-primary btn-sm btn-verify-action"
                            disabled={actionLoading}
                          >
                            <CheckCircle size={15} /> Verify Provider
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* USER DIRECTORY TAB */}
            {activeTab === 'directory' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div>
                    <h2>User Directory & Access Control</h2>
                    <p className="pane-subtitle">Search, inspect, and toggle active / suspended accounts across all roles</p>
                  </div>
                </div>

                <div className="directory-toolbar">
                  <div className="tab-group">
                    <button
                      className={`directory-subtab ${activeDirectoryTab === 'owners' ? 'active' : ''}`}
                      onClick={() => setActiveDirectoryTab('owners')}
                    >
                      Property Owners ({usersDirectory.owners.length})
                    </button>
                    <button
                      className={`directory-subtab ${activeDirectoryTab === 'providers' ? 'active' : ''}`}
                      onClick={() => setActiveDirectoryTab('providers')}
                    >
                      Meal Providers ({usersDirectory.providers.length})
                    </button>
                    <button
                      className={`directory-subtab ${activeDirectoryTab === 'students' ? 'active' : ''}`}
                      onClick={() => setActiveDirectoryTab('students')}
                    >
                      Students ({usersDirectory.students.length})
                    </button>
                  </div>

                  <div className="search-box-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or campus..."
                      className="directory-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="directory-table-card">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name / Entity</th>
                        <th>Email</th>
                        <th>Role Details</th>
                        <th>Verification</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeDirectoryTab === 'owners' && usersDirectory.owners
                        .filter(u => `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((owner) => (
                          <tr key={`dir-owner-${owner.owner_id}`}>
                            <td>#{owner.owner_id}</td>
                            <td><strong>{owner.first_name} {owner.last_name}</strong></td>
                            <td>{owner.email}</td>
                            <td>Property Host</td>
                            <td>
                              <span className={`badge badge-${owner.verification_status}`}>
                                {owner.verification_status}
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill ${owner.is_active ? 'pill-approved' : 'pill-rejected'}`}>
                                {owner.is_active ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleToggleUserStatus('property_owner', owner.owner_id, owner.is_active)}
                                className={`btn-status-toggle ${owner.is_active ? 'suspend' : 'activate'}`}
                                disabled={actionLoading}
                              >
                                {owner.is_active ? <><Lock size={13} /> Suspend</> : <><Unlock size={13} /> Reactivate</>}
                              </button>
                            </td>
                          </tr>
                        ))}

                      {activeDirectoryTab === 'providers' && usersDirectory.providers
                        .filter(u => `${u.business_name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((provider) => (
                          <tr key={`dir-provider-${provider.provider_id}`}>
                            <td>#{provider.provider_id}</td>
                            <td><strong>{provider.business_name}</strong> ({provider.first_name})</td>
                            <td>{provider.email}</td>
                            <td>Meal Provider</td>
                            <td>
                              <span className={`badge badge-${provider.verification_status}`}>
                                {provider.verification_status}
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill ${provider.is_active ? 'pill-approved' : 'pill-rejected'}`}>
                                {provider.is_active ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleToggleUserStatus('meal_provider', provider.provider_id, provider.is_active)}
                                className={`btn-status-toggle ${provider.is_active ? 'suspend' : 'activate'}`}
                                disabled={actionLoading}
                              >
                                {provider.is_active ? <><Lock size={13} /> Suspend</> : <><Unlock size={13} /> Reactivate</>}
                              </button>
                            </td>
                          </tr>
                        ))}

                      {activeDirectoryTab === 'students' && usersDirectory.students
                        .filter(u => `${u.first_name} ${u.last_name} ${u.email} ${u.university_name}`.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((student) => (
                          <tr key={`dir-student-${student.student_id}`}>
                            <td>#{student.student_id}</td>
                            <td><strong>{student.first_name} {student.last_name}</strong></td>
                            <td>{student.email}</td>
                            <td>{student.university_name || 'Undergraduate'}</td>
                            <td><span className="badge badge-verified">Verified</span></td>
                            <td>
                              <span className={`status-pill ${student.is_active ? 'pill-approved' : 'pill-rejected'}`}>
                                {student.is_active ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleToggleUserStatus('student', student.student_id, student.is_active)}
                                className={`btn-status-toggle ${student.is_active ? 'suspend' : 'activate'}`}
                                disabled={actionLoading}
                              >
                                {student.is_active ? <><Lock size={13} /> Suspend</> : <><Unlock size={13} /> Reactivate</>}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CAMPUS COORDINATES CONFIGURATION TAB */}
            {activeTab === 'universities' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div>
                    <h2>Campus Universities & Coordinates</h2>
                    <p className="pane-subtitle">Configure reference GPS coordinates and cities for distance calculation across housing & catering</p>
                  </div>
                  <button 
                    onClick={() => setShowUniModal(true)} 
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={16} /> Add Campus
                  </button>
                </div>

                <div className="directory-table-card">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>University / Campus Name</th>
                        <th>City / Region</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Coordinates Badge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {universitiesList.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            No university coordinate records found. Click "+ Add Campus" to register one.
                          </td>
                        </tr>
                      ) : (
                        universitiesList.map((uni) => (
                          <tr key={uni.university_id}>
                            <td>#{uni.university_id}</td>
                            <td>
                              <strong>{uni.name}</strong>
                            </td>
                            <td>{uni.city}</td>
                            <td><code>{uni.latitude}</code></td>
                            <td><code>{uni.longitude}</code></td>
                            <td>
                              <span className="coord-pill">
                                <MapPin size={12} /> {parseFloat(uni.latitude).toFixed(4)}, {parseFloat(uni.longitude).toFixed(4)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INQUIRIES & SUPPORT TICKETS TAB */}
            {activeTab === 'inquiries' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div>
                    <h2>Support Inquiries & User Helpdesk</h2>
                    <p className="pane-subtitle">Review questions submitted by Students, Owners, Providers, and Campus Guests</p>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="inquiries-filter-bar">
                  <button 
                    className={`inquiry-filter-btn ${inquiryFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setInquiryFilter('all')}
                  >
                    All Inquiries ({inquiries.length})
                  </button>
                  <button 
                    className={`inquiry-filter-btn ${inquiryFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setInquiryFilter('pending')}
                  >
                    Pending Review ({pendingInquiriesCount})
                  </button>
                  <button 
                    className={`inquiry-filter-btn ${inquiryFilter === 'responded' ? 'active' : ''}`}
                    onClick={() => setInquiryFilter('responded')}
                  >
                    Responded ({inquiries.filter((i) => i.status === 'responded').length})
                  </button>
                </div>

                <div className="directory-table-card">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Sender</th>
                        <th>Role</th>
                        <th>Inquiry Subject & Message</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInquiries.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                            No support inquiries found in this view.
                          </td>
                        </tr>
                      ) : (
                        filteredInquiries.map((inq) => (
                          <tr key={inq.inquiry_id}>
                            <td>#{inq.inquiry_id}</td>
                            <td>{new Date(inq.created_at).toLocaleDateString()}</td>
                            <td>
                              <strong>{inq.full_name}</strong>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{inq.email}</div>
                            </td>
                            <td>
                              <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                                {inq.user_role || 'Guest'}
                              </span>
                            </td>
                            <td>
                              <div className="inquiry-detail-preview">
                                <strong>{inq.subject}</strong>
                                <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.85rem' }}>{inq.message}</p>
                                {inq.admin_response && (
                                  <div className="inquiry-response-preview">
                                    <strong>Admin Response:</strong> {inq.admin_response}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`status-pill ${inq.status === 'responded' ? 'pill-approved' : 'pill-pending'}`}>
                                {inq.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleOpenResponseModal(inq)}
                                className="btn btn-outline btn-sm"
                              >
                                {inq.status === 'responded' ? 'Edit Response' : 'Respond'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="tab-pane">
                <ProfileSection />
              </div>
            )}
          </>
        )}
      </main>

      {/* RESPONSE MODAL */}
      {selectedInquiry && (
        <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="modal-card modern-admin-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff' }}>
            <div className="admin-modal-header">
              <div className="admin-modal-header-left">
                <div className="admin-modal-icon-badge">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h2>Respond to Inquiry #{selectedInquiry.inquiry_id}</h2>
                  <p className="modal-sub-desc">Sender will receive immediate in-app notice and resolution status</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedInquiry(null)} title="Close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitResponse}>
              <div className="modal-body-padding">
                <div className="modal-inquiry-summary">
                  <p><strong>From:</strong> {selectedInquiry.full_name} ({selectedInquiry.email}) • <span style={{ textTransform: 'capitalize' }}>{selectedInquiry.user_role || 'Guest'}</span></p>
                  <p><strong>Subject:</strong> {selectedInquiry.subject}</p>
                  <p><strong>Message:</strong> "{selectedInquiry.message}"</p>
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Official Resolution Response</label>
                  <textarea
                    rows="4"
                    value={adminResponseText}
                    onChange={(e) => setAdminResponseText(e.target.value)}
                    placeholder="Type your response here. If the sender is a registered student, owner, or provider, they will receive an instant notification..."
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-actions" style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" className="btn btn-outline admin-btn-cancel" onClick={() => setSelectedInquiry(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary admin-btn-submit" disabled={responseLoading}>
                  <Send size={16} /> <span>{responseLoading ? 'Sending...' : 'Send Response'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD UNIVERSITY MODAL */}
      {showUniModal && (
        <div className="modal-overlay" onClick={() => setShowUniModal(false)}>
          <div className="modal-card modern-admin-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff' }}>
            <div className="admin-modal-header">
              <div className="admin-modal-header-left">
                <div className="admin-modal-icon-badge">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h2>Add University Campus</h2>
                  <p className="modal-sub-desc">Register GPS coordinates for distance-to-campus calculations</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowUniModal(false)} title="Close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-scrollable-content admin-modal-scrollable">
              <form onSubmit={handleAddUniversity} className="admin-modal-form" style={{ background: '#ffffff' }}>
                {/* Informational Guidance Banner */}
                <div className="campus-geo-tip-banner full-width">
                  <div className="tip-icon-wrap">
                    <Info size={18} />
                  </div>
                  <div className="tip-content">
                    <strong>Geospatial Distance Calculation</strong>
                    <span>UniStay automatically computes 5km commute zones and walking distances from student boarding places to these coordinates.</span>
                  </div>
                </div>

                {/* SECTION 1: CAMPUS DETAILS */}
                <div className="admin-form-section-title full-width">
                  <Building2 size={16} />
                  <span>Campus Identity &amp; Location</span>
                </div>

                <div className="form-group full-width">
                  <label>
                    <span><GraduationCap size={15} /> University / Campus Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. University of Moratuwa"
                    value={uniFormData.name}
                    onChange={(e) => setUniFormData({ ...uniFormData, name: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    <span><MapPin size={15} /> City / Campus Location</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Katubedda, Moratuwa"
                    value={uniFormData.city}
                    onChange={(e) => setUniFormData({ ...uniFormData, city: e.target.value })}
                  />
                </div>

                {/* SECTION 2: GPS COORDINATES */}
                <div className="admin-form-section-title full-width">
                  <Navigation size={16} />
                  <span>GPS Decimal Coordinates (WGS84)</span>
                </div>

                <div className="form-group">
                  <label>
                    <span><Navigation size={14} /> Latitude</span>
                    <span className="coord-hint">e.g. 6.7951</span>
                  </label>
                  <div className="coord-input-wrapper">
                    <input
                      type="text"
                      required
                      placeholder="6.7951"
                      value={uniFormData.latitude}
                      onChange={(e) => setUniFormData({ ...uniFormData, latitude: e.target.value })}
                      className="coord-input"
                    />
                    <span className="coord-badge-tag">° N/S</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <span><Navigation size={14} /> Longitude</span>
                    <span className="coord-hint">e.g. 79.9009</span>
                  </label>
                  <div className="coord-input-wrapper">
                    <input
                      type="text"
                      required
                      placeholder="79.9009"
                      value={uniFormData.longitude}
                      onChange={(e) => setUniFormData({ ...uniFormData, longitude: e.target.value })}
                      className="coord-input"
                    />
                    <span className="coord-badge-tag">° E/W</span>
                  </div>
                </div>

                <div className="admin-modal-actions full-width">
                  <button type="button" className="btn btn-outline admin-btn-cancel" onClick={() => setShowUniModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary admin-btn-submit" disabled={actionLoading}>
                    <Plus size={16} />
                    <span>{actionLoading ? 'Saving...' : 'Save University'}</span>
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
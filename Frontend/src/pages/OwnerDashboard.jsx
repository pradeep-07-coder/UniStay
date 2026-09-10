import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import ProfileSection from '../components/ProfileSection';
import { 
  Home, Plus, CheckCircle, XCircle, Clock, MapPin, 
  Trash2, Edit3, Image as ImageIcon, RefreshCw, X, Shield, 
  LayoutDashboard, Building, Calendar, User, LogOut, ChevronRight,
  Mail, Phone, AlertCircle, Sparkles, UploadCloud, GraduationCap, 
  Building2, Navigation, Wind, Users, FileText, Tag
} from 'lucide-react';
import './OwnerDashboard.css';

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Navigation Tab State ('overview' | 'listings' | 'requests' | 'profile')
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');

  // Primary Data States
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Universities state
  const [universities, setUniversities] = useState([]);

  // Modal State for Create/Edit Accommodation
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    street: '',
    city: '',
    district: '',
    latitude: '',
    longitude: '',
    price_per_month: '',
    university_id: '',
    room_type: 'Single',
    total_rooms: '',
    ac_status: false,
    rules_and_facilities: '',
    availability_status: true,
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
    fetchOwnerData();
    API.get('/accommodations/universities/list')
      .then((res) => setUniversities(res.data?.data?.universities || []))
      .catch((err) => console.error('Fetch Universities Error:', err));
  }, []);

  const fetchOwnerData = async () => {
    setLoading(true);
    setError('');
    try {
      const [listingsRes, bookingsRes] = await Promise.all([
        API.get('/accommodations/owner/my-listings'),
        API.get('/bookings/owner'),
      ]);

      setListings(listingsRes.data?.data?.accommodations || []);
      setBookings(bookingsRes.data?.data?.bookings || []);
    } catch (err) {
      console.error('Owner Data Fetch Error:', err);
      setError('Could not fetch your owner data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'university_id' && value) {
      const selectedUni = universities.find((u) => String(u.university_id) === String(value));
      setFormData((prev) => ({
        ...prev,
        university_id: value,
        latitude: prev.latitude || (selectedUni?.latitude ? String(parseFloat(selectedUni.latitude)) : ''),
        longitude: prev.longitude || (selectedUni?.longitude ? String(parseFloat(selectedUni.longitude)) : ''),
        city: prev.city || selectedUni?.city || '',
        district: prev.district || selectedUni?.city || '',
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      street: '',
      city: '',
      district: '',
      latitude: '',
      longitude: '',
      price_per_month: '',
      university_id: '',
      room_type: 'Single',
      total_rooms: '',
      ac_status: false,
      rules_and_facilities: '',
      availability_status: true,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const openEditModal = (listing) => {
    setEditingId(listing.accommodation_id);
    setFormData({
      title: listing.title || '',
      description: listing.description || '',
      street: listing.street || '',
      city: listing.city || '',
      district: listing.district || '',
      latitude: listing.latitude || '',
      longitude: listing.longitude || '',
      price_per_month: listing.price_per_month || '',
      university_id: listing.university_id || '',
      room_type: listing.room_type || 'Single',
      total_rooms: listing.total_rooms || '',
      ac_status: listing.ac_status || false,
      rules_and_facilities: listing.rules_and_facilities || '',
      availability_status: listing.availability_status ?? true,
    });
    setImageFiles([]);
    setImagePreviews(listing.image_urls || (listing.image_url ? [listing.image_url] : []));
    setShowModal(true);
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const selectedUni = universities.find((u) => String(u.university_id) === String(formData.university_id));
      const submitData = {
        ...formData,
        latitude: formData.latitude || (selectedUni?.latitude ? String(parseFloat(selectedUni.latitude)) : '6.7951'),
        longitude: formData.longitude || (selectedUni?.longitude ? String(parseFloat(selectedUni.longitude)) : '79.9009'),
        total_rooms: formData.total_rooms || '1',
        district: formData.district || formData.city || 'Colombo',
      };

      const data = new FormData();
      Object.keys(submitData).forEach((key) => data.append(key, submitData[key]));
      imageFiles.forEach((file) => data.append('images', file));

      if (editingId) {
        await API.put(`/accommodations/${editingId}`, data);
      } else {
        await API.post('/accommodations', data);
      }

      setShowModal(false);
      fetchOwnerData();
    } catch (err) {
      console.error('Save Listing Error:', err);
      alert(err.response?.data?.message || 'Failed to save listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    setActionLoading(true);
    try {
      await API.delete(`/accommodations/${id}`);
      await fetchOwnerData();
    } catch (err) {
      console.error('Delete Listing Error:', err);
      alert(err.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookingStatus = async (bookingId, newStatus) => {
    setActionLoading(true);
    try {
      await API.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      await fetchOwnerData();
    } catch (err) {
      console.error('Update Booking Error:', err);
      alert(err.response?.data?.message || 'Failed to update booking status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Aggregated Stat Calculations
  const pendingRequestsCount = bookings.filter((b) => b.status === 'pending').length;
  const approvedRequestsCount = bookings.filter((b) => b.status === 'approved').length;

  return (
    <div className="owner-dashboard-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="owner-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Building size={20} />
          </div>
          <div className="sidebar-brand-text">
            <h3>Host Portal</h3>
            <span className="role-indicator">Property Owner</span>
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
            className={`nav-item ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            <Building size={18} />
            <span>My Properties</span>
            {listings.length > 0 && <span className="nav-badge">{listings.length}</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => handleTabChange('requests')}
          >
            <Calendar size={18} />
            <span>Tenant Inquiries</span>
            {pendingRequestsCount > 0 && <span className="nav-badge count-alert">{pendingRequestsCount}</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <User size={18} />
            <span>Host Profile</span>
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
            <span className="user-name">{user?.first_name} {user?.last_name}</span>
            <span className={`user-status-pill ${user?.verification_status === 'verified' ? 'verified' : 'pending'}`}>
              {user?.verification_status?.toUpperCase() || 'OWNER'}
            </span>
          </div>
          <button className="logout-icon-btn" onClick={logout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="owner-main-content">
        {/* HEADER TOPBAR */}
        <header className="owner-topbar">
          <div className="topbar-title">
            <div className="welcome-tag owner-welcome-tag">
              <Shield size={14} />
              <span>Verified Host Portal</span>
            </div>
            <h1>Welcome back, {user?.first_name || 'Owner'}! 🏠</h1>
            <p>Manage your boarding places, monitor occupancy, and accept student tenant inquiries.</p>
          </div>

          <div className="topbar-actions">
            <button onClick={fetchOwnerData} className="btn btn-outline btn-refresh" disabled={loading}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={openCreateModal}
              className="btn btn-primary btn-add-property"
              disabled={user?.verification_status !== 'verified'}
              title={user?.verification_status !== 'verified' ? 'Account verification required before publishing' : 'Publish a new accommodation listing'}
            >
              <Plus size={18} />
              <span>Add New Property</span>
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
              <strong>Account Verification Pending:</strong> Your property host profile is currently under review by system administrators. Property publication unlocks automatically upon approval.
            </div>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="owner-loading-state">
            <div className="spinner"></div>
            <p>Loading your properties and tenant requests...</p>
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
                <div className="owner-stats-grid">
                  <div className="owner-stat-card" onClick={() => setActiveTab('listings')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon icon-teal">
                      <Building size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{listings.length}</span>
                      <span className="stat-label">Total Properties</span>
                      <span className="stat-sub">Active off-campus boarding places</span>
                    </div>
                  </div>

                  <div className="owner-stat-card" onClick={() => setActiveTab('requests')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon icon-amber">
                      <Clock size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{pendingRequestsCount}</span>
                      <span className="stat-label">Pending Requests</span>
                      <span className="stat-sub">Waiting for landlord approval</span>
                    </div>
                  </div>

                  <div className="owner-stat-card" onClick={() => setActiveTab('requests')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon icon-green">
                      <CheckCircle size={24} />
                    </div>
                    <div className="stat-data">
                      <span className="stat-value">{approvedRequestsCount}</span>
                      <span className="stat-label">Approved Tenants</span>
                      <span className="stat-sub">Confirmed student boarders</span>
                    </div>
                  </div>
                </div>

                {/* OVERVIEW SPLIT PREVIEWS */}
                <div className="overview-split-grid">
                  {/* RECENT PROPERTIES PREVIEW */}
                  <div className="preview-card">
                    <div className="preview-header">
                      <div>
                        <h3>Active Property Listings</h3>
                        <p className="card-sub-desc">Recently published boarding places</p>
                      </div>
                      <button onClick={() => setActiveTab('listings')} className="btn-link">
                        View All <ChevronRight size={14} />
                      </button>
                    </div>

                    {listings.length === 0 ? (
                      <div className="card-empty-state">
                        <Building size={36} className="empty-state-icon" />
                        <p>No accommodations listed yet.</p>
                      </div>
                    ) : (
                      <div className="preview-list">
                        {listings.slice(0, 3).map((item) => (
                          <div key={item.accommodation_id} className="mini-item-row">
                            <img
                              src={
                                (item.image_urls && item.image_urls[0]) ||
                                item.image_url ||
                                'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200'
                              }
                              alt={item.title}
                              className="mini-thumb"
                            />
                            <div className="mini-info">
                              <h4>{item.title}</h4>
                              <p className="item-sub"><MapPin size={12} /> {item.city} • LKR {parseFloat(item.price_per_month).toLocaleString()}/mo</p>
                            </div>
                            <span className={`availability-badge ${item.availability_status ? 'available' : 'occupied'}`}>
                              {item.availability_status ? 'Available' : 'Occupied'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* INCOMING REQUESTS PREVIEW */}
                  <div className="preview-card">
                    <div className="preview-header">
                      <div>
                        <h3>Recent Booking Inquiries</h3>
                        <p className="card-sub-desc">Latest student tenancy requests</p>
                      </div>
                      <button onClick={() => setActiveTab('requests')} className="btn-link">
                        View All <ChevronRight size={14} />
                      </button>
                    </div>

                    {bookings.length === 0 ? (
                      <div className="card-empty-state">
                        <Calendar size={36} className="empty-state-icon" />
                        <p>No booking requests received yet.</p>
                      </div>
                    ) : (
                      <div className="preview-list">
                        {bookings.slice(0, 3).map((req) => (
                          <div key={req.booking_id} className="mini-item-row">
                            <div className="mini-info">
                              <h4>{req.accommodation_title}</h4>
                              <p className="item-sub">Student: <strong>{req.student_first_name} {req.student_last_name}</strong></p>
                            </div>
                            <span className={`status-pill pill-${req.status}`}>
                              {req.status.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MY PROPERTIES LISTINGS TAB */}
            {activeTab === 'listings' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div>
                    <h2>Property Listings Management</h2>
                    <p className="pane-subtitle">Manage boarding rooms, edit rent prices, and update photo galleries</p>
                  </div>
                  <span className="count-tag owner-count-tag">{listings.length} Published</span>
                </div>

                {listings.length === 0 ? (
                  <div className="modern-empty-state">
                    <Building size={44} className="empty-state-icon" />
                    <h3>No Properties Listed Yet</h3>
                    <p>Click "Add New Property" to publish your first accommodation for nearby university students.</p>
                    <button 
                      onClick={openCreateModal}
                      className="btn btn-primary"
                      style={{ marginTop: '1rem' }}
                      disabled={user?.verification_status !== 'verified'}
                    >
                      <Plus size={16} /> Add New Property
                    </button>
                  </div>
                ) : (
                  <div className="owner-listings-grid">
                    {listings.map((item) => (
                      <div key={item.accommodation_id} className="modern-property-card">
                        <div className="card-media">
                          <img
                            src={
                              (item.image_urls && item.image_urls[0]) ||
                              item.image_url ||
                              'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500'
                            }
                            alt={item.title}
                          />
                          <span className={`availability-badge ${item.availability_status ? 'available' : 'occupied'}`}>
                            {item.availability_status ? 'Available' : 'Occupied'}
                          </span>
                        </div>

                        <div className="card-body">
                          <h3>{item.title}</h3>
                          <p className="location-text"><MapPin size={14} /> {item.street}, {item.city}</p>
                          
                          <div className="card-tags-row">
                            <span className="tag-pill">{item.room_type || 'Single'}</span>
                            <span className="tag-pill">{item.ac_status ? 'AC' : 'Non-AC'}</span>
                            <span className="tag-pill">{item.total_rooms || 1} Room(s)</span>
                          </div>

                          <div className="card-price-row">
                            <span className="price-label">Monthly Rent</span>
                            <span className="price-val">LKR {parseFloat(item.price_per_month).toLocaleString()}/mo</span>
                          </div>

                          <div className="card-actions-row">
                            <button onClick={() => openEditModal(item)} className="btn-card-outline">
                              <Edit3 size={14} /> Edit
                            </button>
                            <button onClick={() => handleDeleteListing(item.accommodation_id)} className="btn-card-danger">
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

            {/* BOOKING REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div>
                    <h2>Incoming Tenant Inquiries</h2>
                    <p className="pane-subtitle">Review undergraduate background details and accept or reject reservations</p>
                  </div>
                  <span className="count-tag owner-count-tag">{bookings.length} Total Requests</span>
                </div>

                {bookings.length === 0 ? (
                  <div className="modern-empty-state">
                    <Calendar size={44} className="empty-state-icon" />
                    <h3>No Booking Requests</h3>
                    <p>When students submit check-in requests for your properties, they will appear here for review.</p>
                  </div>
                ) : (
                  <div className="requests-flex-list">
                    {bookings.map((req) => (
                      <div key={req.booking_id} className="modern-request-card">
                        <div className="request-main-info">
                          <h3>{req.accommodation_title}</h3>
                          <p className="student-detail">
                            Requested by: <strong>{req.student_first_name} {req.student_last_name}</strong> • <em>{req.university_name || 'University Student'}</em>
                          </p>
                          <div className="contact-meta">
                            <span><Mail size={13} /> {req.student_email}</span>
                            <span><Phone size={13} /> {req.student_phone || 'No phone provided'}</span>
                          </div>
                          <p className="checkin-date">
                            📅 Expected Check-in Date: <strong>{new Date(req.check_in_date).toLocaleDateString()}</strong>
                          </p>
                        </div>

                        <div className="request-action-col">
                          <span className={`status-pill pill-${req.status}`}>
                            {req.status.toUpperCase()}
                          </span>

                          {req.status === 'pending' && (
                            <div className="decision-buttons">
                              <button
                                onClick={() => handleBookingStatus(req.booking_id, 'approved')}
                                className="btn-approve"
                                disabled={actionLoading}
                              >
                                <CheckCircle size={14} /> Approve Tenant
                              </button>
                              <button
                                onClick={() => handleBookingStatus(req.booking_id, 'rejected')}
                                className="btn-reject"
                                disabled={actionLoading}
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* CREATE / EDIT PROPERTY MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-lg modern-owner-modal" style={{ background: '#ffffff' }}>
            <div className="modal-header owner-modal-header">
              <div className="modal-header-icon-title">
                <div className="modal-title-icon-box-owner">
                  <Building size={22} />
                </div>
                <div>
                  <h2>{editingId ? 'Edit Property Listing' : 'Publish New Property'}</h2>
                  <p className="modal-sub-desc">Provide accommodation specs, rental terms, and upload high-res photos</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <div className="modal-scrollable-content">
              <form onSubmit={handleSubmitListing} className="modal-body grid-form owner-modal-form" style={{ background: '#ffffff' }}>
                {/* SECTION 1: BASIC PROPERTY OVERVIEW */}
                <div className="modal-form-section-title-owner full-width">
                  <Sparkles size={16} />
                  <span>Property Overview &amp; Title</span>
                </div>

                <div className="form-group full-width">
                  <label><Building size={14} /> Listing Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Modern Single Room near Moratuwa University"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label><FileText size={14} /> Description &amp; Living Details</label>
                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Details regarding proximity to campus, study desks, quiet environment, water/electricity..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                {/* SECTION 2: PRICING & ROOM SPECS */}
                <div className="modal-form-section-title-owner full-width">
                  <Tag size={16} />
                  <span>Pricing &amp; Room Specifications</span>
                </div>

                <div className="form-group">
                  <label><Tag size={14} /> Monthly Rent (LKR)</label>
                  <div className="price-input-wrapper">
                    <span className="price-currency-prefix-teal">LKR</span>
                    <input
                      type="number"
                      name="price_per_month"
                      required
                      placeholder="25000"
                      value={formData.price_per_month}
                      onChange={handleInputChange}
                      className="price-input-field"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label><GraduationCap size={14} /> Nearest Target University</label>
                  <select
                    name="university_id"
                    value={formData.university_id || ''}
                    onChange={handleInputChange}
                    required
                    className="styled-modal-select"
                  >
                    <option value="">-- Select University --</option>
                    {universities.map((u) => (
                      <option key={u.university_id} value={u.university_id}>
                        {u.name} ({u.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label><Home size={14} /> Room Type</label>
                  <select
                    name="room_type"
                    value={formData.room_type}
                    onChange={handleInputChange}
                    required
                    className="styled-modal-select"
                  >
                    <option value="Single">Single Room</option>
                    <option value="Shared">Shared Room</option>
                    <option value="Annex">Annex Unit</option>
                    <option value="Full House">Full House / Apartment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label><Users size={14} /> Total Rooms Available</label>
                  <input
                    type="number"
                    name="total_rooms"
                    min="1"
                    required
                    placeholder="1"
                    value={formData.total_rooms}
                    onChange={handleInputChange}
                  />
                </div>

                {/* SECTION 3: LOCATION & MAP PROXIMITY */}
                <div className="modal-form-section-title-owner full-width">
                  <MapPin size={16} />
                  <span>Location &amp; 5km Map Coordinates</span>
                </div>

                <div className="form-group">
                  <label><MapPin size={14} /> Street Address</label>
                  <input
                    type="text"
                    name="street"
                    required
                    placeholder="e.g. 45 Bandaranayake Mawatha"
                    value={formData.street}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label><Building2 size={14} /> City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. Moratuwa"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label><Navigation size={14} /> District</label>
                  <input
                    type="text"
                    name="district"
                    required
                    placeholder="e.g. Colombo"
                    value={formData.district}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label><Navigation size={14} /> Latitude (Auto-filled)</label>
                  <input
                    type="text"
                    name="latitude"
                    placeholder="e.g. 6.7951"
                    value={formData.latitude}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label><Navigation size={14} /> Longitude (Auto-filled)</label>
                  <input
                    type="text"
                    name="longitude"
                    placeholder="e.g. 79.9009"
                    value={formData.longitude}
                    onChange={handleInputChange}
                  />
                </div>

                {/* SECTION 4: RULES & AMENITIES */}
                <div className="modal-form-section-title-owner full-width">
                  <Shield size={16} />
                  <span>Rules &amp; Boarding Facilities</span>
                </div>

                <div className="form-group full-width">
                  <label><Shield size={14} /> Rules &amp; Facilities</label>
                  <textarea
                    name="rules_and_facilities"
                    rows="2"
                    placeholder="e.g. Attached bathroom, key money required, study desk included, separate entrance..."
                    value={formData.rules_and_facilities}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Features &amp; Availability</label>
                  <div className="checkbox-toggle-cards">
                    <label className={`toggle-feature-card ${formData.ac_status ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        name="ac_status"
                        checked={formData.ac_status}
                        onChange={handleInputChange}
                        className="hidden-checkbox"
                      />
                      <div className="toggle-icon-wrap">
                        <Wind size={20} />
                      </div>
                      <div className="toggle-text">
                        <strong>Air Conditioned</strong>
                        <span>AC room available for tenant</span>
                      </div>
                      <div className={`custom-checkbox-mark ${formData.ac_status ? 'checked' : ''}`}>
                        <CheckCircle size={18} />
                      </div>
                    </label>

                    <label className={`toggle-feature-card ${formData.availability_status ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        name="availability_status"
                        checked={formData.availability_status}
                        onChange={handleInputChange}
                        className="hidden-checkbox"
                      />
                      <div className="toggle-icon-wrap">
                        <Home size={20} />
                      </div>
                      <div className="toggle-text">
                        <strong>Available for Renting</strong>
                        <span>Open for immediate student booking</span>
                      </div>
                      <div className={`custom-checkbox-mark ${formData.availability_status ? 'checked' : ''}`}>
                        <CheckCircle size={18} />
                      </div>
                    </label>
                  </div>
                </div>

                {/* SECTION 5: PROPERTY PHOTOS */}
                <div className="modal-form-section-title-owner full-width">
                  <ImageIcon size={16} />
                  <span>High-Res Property Gallery</span>
                </div>

                <div className="form-group full-width">
                  <label><ImageIcon size={14} /> Property Photos (Select multiple)</label>
                  <div className="modern-file-dropzone dropzone-teal">
                    <label className="file-dropzone-label">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden-file-input"
                        onChange={handleFileChange}
                      />
                      <div className="dropzone-icon-circle dropzone-icon-teal">
                        <UploadCloud size={24} />
                      </div>
                      <div className="dropzone-text">
                        <strong>Click to browse or drag &amp; drop photos</strong>
                        <span>Upload multiple high-res room photos (JPG, PNG, WEBP)</span>
                      </div>
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="owner-preview-gallery">
                      <div className="gallery-counter-bar">
                        <span className="gallery-count-badge">
                          <ImageIcon size={13} /> {imagePreviews.length} Photos Selected
                        </span>
                      </div>
                      <div className="modal-preview-grid">
                        {imagePreviews.map((src, index) => (
                          <div key={index} className="preview-thumb-wrapper">
                            <img src={src} alt={`Preview ${index}`} className="preview-thumb" />
                            <button
                              type="button"
                              className="btn-remove-thumb"
                              onClick={() => handleRemoveImage(index)}
                              title="Remove Photo"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-actions full-width owner-modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-owner-submit" disabled={actionLoading}>
                    <Building size={16} />
                    <span>{actionLoading ? 'Saving...' : editingId ? 'Update Listing' : 'Publish Property'}</span>
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
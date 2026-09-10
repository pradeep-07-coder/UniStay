import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, Phone, Star, ShieldCheck, Check, Home, 
  Wind, Sparkles, ArrowRight, ArrowLeft, Camera, 
  User, Clock
} from 'lucide-react';
import './AccommodationDetails.css';

export default function AccommodationDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [acc, setAcc] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState('');
  const [loading, setLoading] = useState(true);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await API.get(`/accommodations/${id}`);
      const data = res.data.data;
      setAcc(data.accommodation);
      setReviews(data.reviews || []);
      
      const images = data.accommodation.image_urls;
      if (images && images.length > 0) {
        setActiveImg(images[0]);
      } else {
        setActiveImg('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600');
      }
    } catch (err) {
      console.error('Fetch Details Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/accommodations/${id}/reviews`, { rating, comment });
      setComment('');
      fetchDetails();
    } catch (err) {
      alert('Failed to post review.');
    }
  };

  const handleRentNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Navigate to Payment Gateway with state
    navigate('/payment', {
      state: {
        payment_type: 'accommodation_rent',
        reference_id: acc.accommodation_id,
        title: acc.title,
        amount: acc.price_per_month,
        period: '1 Month Valid Rent Pass',
      },
    });
  };

  if (loading) return (
    <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
      <div className="loading-spinner">Loading accommodation details...</div>
    </div>
  );

  if (!acc) return (
    <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
      <h2>Property not found</h2>
      <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The requested listing does not exist or has been removed.</p>
      <Link to="/accommodations" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Back to Accommodations
      </Link>
    </div>
  );

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="container details-page">
      {/* 0. BREADCRUMBS & TOP BAR */}
      <div className="details-top-bar">
        <button onClick={() => navigate(-1)} className="btn-back-link">
          <ArrowLeft size={16} />
          <span>Back to Listings</span>
        </button>
        <div className="details-top-tags">
          <span className="badge-verified-host">
            <ShieldCheck size={14} /> Admin Verified Property
          </span>
          <span className="badge-campus-tag">
            <MapPin size={13} /> {acc.city} ({acc.district})
          </span>
        </div>
      </div>

      {/* 1. IMAGE GALLERY */}
      <div className="gallery-section">
        <div className="main-image-box">
          <img src={activeImg} alt={acc.title} className="main-img" />
          <div className="gallery-floating-overlay">
            <span className="gallery-badge-type">
              <Sparkles size={12} /> {acc.room_type || 'Verified'}
            </span>
            <span className="gallery-badge-count">
              <Camera size={13} /> {acc.image_urls?.length || 1} Photos
            </span>
          </div>
        </div>

        {acc.image_urls && acc.image_urls.length > 1 && (
          <div className="thumbnail-row">
            {acc.image_urls.map((img, idx) => (
              <div 
                key={idx} 
                className={`thumb-wrapper ${activeImg === img ? 'active' : ''}`}
                onClick={() => setActiveImg(img)}
              >
                <img
                  src={img}
                  alt={`thumbnail-${idx + 1}`}
                  className="thumb-img"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. PROPERTY DETAILS & STICKY BOOKING CARD */}
      <div className="details-layout">
        <div className="details-info">
          <div className="details-heading-wrap">
            <h1>{acc.title}</h1>
            <p className="location-text">
              <MapPin size={16} className="text-primary" /> 
              <span>{acc.street}, {acc.city} &bull; {acc.district} District</span>
            </p>
          </div>

          {/* Key Specs Grid */}
          <div className="specs-grid">
            <div className="spec-card">
              <div className="spec-icon spec-icon-blue">
                <Home size={20} />
              </div>
              <div className="spec-content">
                <span className="spec-label">Room Type</span>
                <strong>{acc.room_type} Room</strong>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon spec-icon-teal">
                <Sparkles size={20} />
              </div>
              <div className="spec-content">
                <span className="spec-label">Vacancy</span>
                <strong>{acc.total_rooms || 1} Rooms Available</strong>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon spec-icon-indigo">
                <Wind size={20} />
              </div>
              <div className="spec-content">
                <span className="spec-label">Air Condition</span>
                <strong>{acc.ac_status ? 'A/C Room' : 'Non-A/C Natural'}</strong>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon spec-icon-amber">
                <ShieldCheck size={20} />
              </div>
              <div className="spec-content">
                <span className="spec-label">Landlord Trust</span>
                <strong>Verified Owner</strong>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="info-card description-card">
            <h3>About This Living Space</h3>
            <p>{acc.description || 'Comfortable and student-friendly accommodation located in a peaceful university neighborhood with direct access to public transit and lecture halls.'}</p>
          </div>

          {/* Facilities & Rules Card */}
          <div className="info-card facilities-card">
            <h3>Rules &amp; Boarding Facilities</h3>
            <div className="facilities-content">
              <p>{acc.rules_and_facilities || 'Standard student boarding terms apply. Please observe quiet hours during exam seasons and adhere to house regulations.'}</p>
            </div>
          </div>
        </div>

        {/* STICKY RENT CARD */}
        <div className="rent-card">
          <div className="rent-card-badge">
            <ShieldCheck size={14} />
            <span>Verified Student Housing</span>
          </div>

          <div className="price-header">
            <div>
              <span className="rent-amount">LKR {parseFloat(acc.price_per_month).toLocaleString()}</span>
              <span className="rent-unit">/ Month</span>
            </div>
            <span className="rent-period-pill">Monthly Pass</span>
          </div>

          <div className="rent-divider"></div>

          {/* Host Info Box */}
          <div className="host-profile-box">
            <div className="host-avatar">
              <User size={20} />
            </div>
            <div className="host-details">
              <span className="host-label">Property Landlord</span>
              <strong>{acc.first_name} {acc.last_name}</strong>
              <a href={`tel:${acc.phone_number}`} className="host-phone-link">
                <Phone size={13} /> {acc.phone_number}
              </a>
            </div>
          </div>

          <div className="rent-guarantees">
            <div className="guarantee-item">
              <Check size={14} /> <span>Zero Broker Fees or Commissions</span>
            </div>
            <div className="guarantee-item">
              <Check size={14} /> <span>1 Month Direct Owner Booking Pass</span>
            </div>
            <div className="guarantee-item">
              <Check size={14} /> <span>Direct Verified Host Assistance</span>
            </div>
          </div>

          <div className="rent-cta-wrap">
            {!acc.availability_status ? (
              <div className="rent-status-message error-box">
                <button 
                  disabled 
                  className="btn btn-block btn-lg btn-disabled-status"
                >
                  Already Rented Out
                </button>
                <p>This accommodation is currently occupied and unavailable for renting.</p>
              </div>
            ) : user && (user.role === 'property_owner' || user.role === 'meal_provider') ? (
              <div className="rent-status-message warning-box">
                <button 
                  disabled 
                  className="btn btn-block btn-lg btn-restricted"
                >
                  Rent Now (Student Only)
                </button>
                <p>Accommodation reservations are available exclusively for registered student accounts.</p>
              </div>
            ) : (
              <button onClick={handleRentNow} className="btn btn-primary btn-block btn-lg btn-rent-now">
                <span>Rent Now with UniStay</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. REVIEWS SECTION */}
      <section className="reviews-section">
        <div className="reviews-section-header">
          <div>
            <h2>Student Reviews &amp; Ratings</h2>
            <p>Feedback from students who stayed at this boarding facility</p>
          </div>
          <div className="reviews-summary-badge">
            <Star size={18} className="star-icon-filled" />
            <strong>{avgRating}</strong>
            <span>({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})</span>
          </div>
        </div>

        {user?.role === 'student' && (
          <form onSubmit={handlePostReview} className="review-form">
            <div className="review-form-header">
              <Sparkles size={16} />
              <h4>Leave a Student Review</h4>
            </div>
            <div className="form-group">
              <label>Your Rating</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)} className="review-rating-select">
                <option value={5}>⭐⭐⭐⭐⭐ (5/5) - Excellent Stay</option>
                <option value={4}>⭐⭐⭐⭐ (4/5) - Very Good</option>
                <option value={3}>⭐⭐⭐ (3/5) - Average Stay</option>
                <option value={2}>⭐⭐ (2/5) - Disappointing</option>
                <option value={1}>⭐ (1/5) - Poor Experience</option>
              </select>
            </div>
            <div className="form-group">
              <label>Your Experience Feedback</label>
              <textarea
                rows="3"
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share insights about facilities, study environment, landlord friendliness, noise levels..."
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary btn-sm btn-post-review">
              <span>Post Review</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div className="no-reviews-box">
              <Star size={32} />
              <p>No student reviews posted yet. Be the first to share your experience!</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.review_id} className="review-item">
                <div className="review-item-top">
                  <div className="reviewer-avatar">
                    {(r.first_name?.[0] || 'S').toUpperCase()}
                  </div>
                  <div className="reviewer-meta">
                    <strong>{r.first_name} {r.last_name}</strong>
                    <span className="reviewer-verified-tag">Verified Student</span>
                  </div>
                  <div className="review-stars">
                    {'⭐'.repeat(r.rating)}
                  </div>
                </div>
                <p className="review-comment">{r.comment}</p>
                <span className="review-date">
                  <Clock size={12} /> {new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

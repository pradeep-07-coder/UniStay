import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, Star, Sun, Moon, UtensilsCrossed, 
  Utensils, Check, Plus, Phone, MapPin, 
  ShieldCheck, GraduationCap, ArrowLeft, ArrowRight, 
  Clock, Sparkles, X 
} from 'lucide-react';
import './MealPlanDetails.css';

export default function MealPlanDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [foods, setFoods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchMealDetails();
  }, [id]);

  const fetchMealDetails = async () => {
    try {
      const res = await API.get(`/meal-plans/${id}`);
      setPlan(res.data.data.meal_plan);
      setFoods(res.data.data.food_items || []);
      setReviews(res.data.data.reviews || []);
    } catch (err) {
      console.error('Fetch Meal Details Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFoodSelection = (foodId) => {
    if (selectedFoodIds.includes(foodId)) {
      setSelectedFoodIds(selectedFoodIds.filter(fId => fId !== foodId));
    } else {
      setSelectedFoodIds([...selectedFoodIds, foodId]);
    }
  };

  const selectedFoods = foods.filter(f => selectedFoodIds.includes(f.food_id));
  const subtotal = selectedFoods.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);

  const handlePlaceOrder = async () => {
    if (!user) return navigate('/login');
    if (selectedFoods.length === 0) return alert('Please select at least one food choice.');

    try {
      await API.post('/food-orders/place', {
        meal_plan_id: plan.meal_plan_id,
        provider_id: plan.provider_id,
        selected_foods: selectedFoods,
        total_amount: subtotal
      });

      alert('🎉 Order Placed Successfully! Check student dashboard.');
      setSelectedFoodIds([]);
    } catch (err) {
      alert('Failed to place order.');
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/meal-plans/${id}/reviews`, { rating, comment });
      setComment('');
      fetchMealDetails();
    } catch (err) {
      alert('Failed to post review.');
    }
  };

  if (loading) return (
    <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
      <div className="loading-spinner">Loading meal plan details...</div>
    </div>
  );

  if (!plan) return (
    <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
      <h2>Meal plan not found</h2>
      <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The requested meal plan does not exist or has been removed.</p>
      <Link to="/meal-plans" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Back to Meal Plans
      </Link>
    </div>
  );

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="container meal-details-page">
      {/* 0. TOP CONTEXT / BREADCRUMBS BAR */}
      <div className="meal-top-bar">
        <button onClick={() => navigate(-1)} className="btn-back-link">
          <ArrowLeft size={16} />
          <span>Back to Meal Plans</span>
        </button>
        <div className="meal-top-tags">
          <span className="badge-verified-catering">
            <ShieldCheck size={14} /> Admin Verified Catering
          </span>
          {plan.university_name && (
            <span className="badge-university-tag">
              <GraduationCap size={13} /> {plan.university_name}
            </span>
          )}
          {plan.city && (
            <span className="badge-location-tag">
              <MapPin size={13} /> {plan.city}
            </span>
          )}
        </div>
      </div>

      {/* 1. CULINARY HERO PROFILE CARD */}
      <div className="meal-hero-card">
        <div className="meal-hero-main">
          <div className="meal-hero-badge-row">
            <span className="hero-cuisine-tag">
              <Sparkles size={13} /> Campus Dining Plan
            </span>
            <span className="hero-rating-pill">
              <Star size={13} className="star-fill" /> {avgRating} ({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})
            </span>
          </div>

          <h1 className="meal-hero-title">{plan.plan_name}</h1>

          <div className="provider-info-strip">
            <div className="provider-avatar">
              <Utensils size={20} />
            </div>
            <div className="provider-text">
              <span className="provider-label">Culinary Provider</span>
              <strong className="provider-name">{plan.business_name || 'Verified Kitchen'}</strong>
            </div>
            {(plan.provider_phone || plan.phone_number) && (
              <a href={`tel:${plan.provider_phone || plan.phone_number}`} className="provider-phone-btn">
                <Phone size={13} />
                <span>{plan.provider_phone || plan.phone_number}</span>
              </a>
            )}
          </div>

          <p className="meal-hero-desc">
            {plan.description || 'Delicious, fresh, and hygienic meals prepared daily specifically for university students with balanced nutrition and timely campus service.'}
          </p>
        </div>

        {/* Culinary Perks Grid */}
        <div className="meal-perks-grid">
          <div className="perk-item">
            <div className="perk-icon perk-icon-amber"><Sparkles size={16} /></div>
            <div className="perk-text">
              <strong>Chef Prepared</strong>
              <span>Cooked fresh every morning</span>
            </div>
          </div>
          <div className="perk-item">
            <div className="perk-icon perk-icon-teal"><ShieldCheck size={16} /></div>
            <div className="perk-text">
              <strong>100% Hygienic</strong>
              <span>Clean kitchen standard</span>
            </div>
          </div>
          <div className="perk-item">
            <div className="perk-icon perk-icon-blue"><ShoppingBag size={16} /></div>
            <div className="perk-text">
              <strong>Instant Digital QR</strong>
              <span>Show code &amp; collect quickly</span>
            </div>
          </div>
          <div className="perk-item">
            <div className="perk-icon perk-icon-green"><Check size={16} /></div>
            <div className="perk-text">
              <strong>Zero Extra Fees</strong>
              <span>Direct student catering price</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MEAL MENU CHOICES */}
      <div className="meal-categories-wrap">
        <div className="menu-section-heading">
          <h2>Select Your Daily Menu Choices</h2>
          <p>Tap food choices below to customize and assemble your daily meal package</p>
        </div>

        {[
          { key: 'Breakfast', label: 'Breakfast Choices', desc: 'Start your study day fueled & fresh', icon: Sun, colorClass: 'cat-breakfast' },
          { key: 'Lunch', label: 'Lunch Specials', desc: 'Hearty mid-day nutrition & hot meals', icon: UtensilsCrossed, colorClass: 'cat-lunch' },
          { key: 'Dinner', label: 'Dinner Choices', desc: 'Wholesome evening dining for campus residents', icon: Moon, colorClass: 'cat-dinner' },
        ].map(({ key, label, desc, icon: CatIcon, colorClass }) => {
          const categoryFoods = foods.filter(f => f.category === key);
          if (categoryFoods.length === 0) return null;

          return (
            <div key={key} className="category-section">
              <div className="category-header">
                <div className={`category-icon-box ${colorClass}`}>
                  <CatIcon size={20} />
                </div>
                <div className="category-title-wrap">
                  <div className="cat-title-row">
                    <h3>{label}</h3>
                    <span className="cat-count-badge">{categoryFoods.length} Choices</span>
                  </div>
                  <span className="category-desc">{desc}</span>
                </div>
              </div>

              <div className="food-cards-grid">
                {categoryFoods.map((food) => {
                  const isSelected = selectedFoodIds.includes(food.food_id);
                  return (
                    <div
                      key={food.food_id}
                      className={`food-card-modern ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleFoodSelection(food.food_id)}
                    >
                      <div className="food-img-wrapper">
                        <img 
                          src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                          alt={food.food_name} 
                          className="food-img"
                        />
                        <div className="food-card-overlay">
                          {isSelected ? (
                            <span className="status-pill selected">
                              <Check size={12} /> Selected
                            </span>
                          ) : (
                            <span className="status-pill available">
                              <Plus size={12} /> Add
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="food-card-body">
                        <div className="food-meta">
                          <span className="food-category-tag">{key}</span>
                          <span className="food-price-tag">
                            LKR {parseFloat(food.price).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="food-title">{food.food_name}</h4>

                        <button 
                          type="button" 
                          className={`btn-toggle-food ${isSelected ? 'is-selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFoodSelection(food.food_id);
                          }}
                        >
                          {isSelected ? (
                            <>
                              <Check size={14} />
                              <span>Added to Order</span>
                            </>
                          ) : (
                            <>
                              <Plus size={14} />
                              <span>Add Choice</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. ORDER SUMMARY BAR / DOCK */}
      <div className={`order-summary-card ${selectedFoods.length > 0 ? 'has-items' : ''}`}>
        <div className="order-summary-left">
          <div className="order-basket-icon-wrap">
            <ShoppingBag size={24} />
            {selectedFoods.length > 0 && (
              <span className="basket-count-badge">{selectedFoods.length}</span>
            )}
          </div>
          <div className="order-summary-details">
            <div className="order-price-line">
              <span className="order-label">Your Custom Order:</span>
              <strong className="order-subtotal">LKR {subtotal.toLocaleString()}</strong>
              <span className="order-items-badge">
                {selectedFoods.length} {selectedFoods.length === 1 ? 'Item' : 'Items'} Selected
              </span>
            </div>

            {selectedFoods.length > 0 ? (
              <div className="selected-chips-row">
                {selectedFoods.map((f) => (
                  <span key={f.food_id} className="selected-chip">
                    <span>{f.food_name}</span>
                    <strong className="chip-price">LKR {parseFloat(f.price).toLocaleString()}</strong>
                    <button 
                      type="button" 
                      className="btn-remove-chip"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFoodSelection(f.food_id);
                      }}
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="order-empty-hint">
                Choose breakfast, lunch, or dinner items above to assemble your meal order package.
              </p>
            )}
          </div>
        </div>

        <div className="order-summary-actions">
          {user && (user.role === 'property_owner' || user.role === 'meal_provider') ? (
            <div className="order-restricted-box">
              <button 
                disabled 
                className="btn btn-order-disabled"
                title="Placing food orders is restricted for property owners and meal providers."
              >
                <ShoppingBag size={18} />
                <span>Place Order (Restricted)</span>
              </button>
              <span className="restricted-warning">
                Ordering is available for student accounts only.
              </span>
            </div>
          ) : (
            <button 
              onClick={handlePlaceOrder} 
              disabled={selectedFoods.length === 0}
              className={`btn btn-place-order-main ${selectedFoods.length === 0 ? 'btn-order-inactive' : ''}`}
            >
              <ShoppingBag size={18} />
              <span>Place Order {selectedFoods.length > 0 ? `• LKR ${subtotal.toLocaleString()}` : ''}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 4. REVIEWS & RATINGS SECTION */}
      <section className="reviews-section">
        <div className="reviews-section-header">
          <div>
            <h2>Student Reviews &amp; Ratings</h2>
            <p>Direct feedback from university students on meal taste, portion sizes, and hygiene</p>
          </div>
          <div className="reviews-summary-badge">
            <Star size={18} className="star-icon-filled" />
            <strong>{avgRating}</strong>
            <span>({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})</span>
          </div>
        </div>

        {/* Review Submission Form for Logged-In Students */}
        {user?.role === 'student' && (
          <form onSubmit={handlePostReview} className="review-form">
            <div className="review-form-header">
              <Sparkles size={16} />
              <h4>Leave a Dining Review</h4>
            </div>
            
            <div className="form-group">
              <label>Your Rating</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)} className="review-rating-select">
                <option value={5}>⭐⭐⭐⭐⭐ (5/5) - Delicious &amp; Fresh</option>
                <option value={4}>⭐⭐⭐⭐ (4/5) - Very Good Taste</option>
                <option value={3}>⭐⭐⭐ (3/5) - Average Quality</option>
                <option value={2}>⭐⭐ (2/5) - Below Expectation</option>
                <option value={1}>⭐ (1/5) - Unsatisfactory</option>
              </select>
            </div>

            <div className="form-group">
              <label>Your Dining Feedback</label>
              <textarea
                rows="3"
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience regarding food freshness, taste, spice levels, portion size, and hygiene..."
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-sm btn-post-review">
              <span>Post Dining Review</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div className="no-reviews-box">
              <Utensils size={36} />
              <p>No student dining reviews posted for this meal provider yet.</p>
              <span>Be the first to order and rate the food quality!</span>
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
                    <span className="reviewer-verified-tag">Verified Student Diner</span>
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
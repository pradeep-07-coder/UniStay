import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { 
  Utensils, ShieldCheck, QrCode, Search, 
  MapPin, CheckCircle, ArrowRight, UserCheck, Sparkles, Star,
  GraduationCap, Coffee, Award, Compass, Building2
} from 'lucide-react';
import unistayHero from '../assets/unistay_hero.jpg';
import unistayDining from '../assets/unistay_dining.jpg';
import './Home.css';

export default function Home() {
  const [featuredAccommodations, setFeaturedAccommodations] = useState([]);
  const [topMealPlans, setTopMealPlans] = useState([]);
  const [loadingShowcase, setLoadingShowcase] = useState(true);

  const universities = [
    { name: 'University of Moratuwa', city: 'Moratuwa', code: 'uom', tag: 'UoM', count: '120+ Listings' },
    { name: 'University of Colombo', city: 'Colombo', code: 'uoc', tag: 'UoC', count: '95+ Listings' },
    { name: 'University of Kelaniya', city: 'Kelaniya', code: 'uok', tag: 'UoK', count: '80+ Listings' },
    { name: 'University of Sri Jayewardenepura', city: 'Gangodawila', code: 'usjp', tag: 'USJ', count: '110+ Listings' },
    { name: 'University of Peradeniya', city: 'Peradeniya', code: 'uop', tag: 'UoP', count: '70+ Listings' },
  ];

  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        const [accRes, mealRes] = await Promise.all([
          API.get('/accommodations'),
          API.get('/meal-plans')
        ]);
        setFeaturedAccommodations(accRes.data?.data?.accommodations?.slice(0, 8) || []);
        setTopMealPlans(mealRes.data?.data?.meal_plans?.slice(0, 8) || []);
      } catch (err) {
        console.warn('Could not load showcase data:', err);
      } finally {
        setLoadingShowcase(false);
      }
    };
    fetchShowcaseData();
  }, []);

  return (
    <div className="landing-page">
      {/* 1. HERO BANNER */}
      <section className="hero-section">
        <div className="hero-backdrop-glow"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} className="hero-badge-sparkle" />
              <span>Sri Lanka's #1 University Living Platform</span>
            </div>
            <h1 className="hero-heading">
              Smart Student <span className="hero-highlight">Accommodations</span> &amp; Daily <span className="hero-highlight-warm">Meal Plans</span>
            </h1>
            <p className="hero-subtext">
              Eliminate broker fees and chaotic social groups. UniStay unites verified university hostels, walkable boarding annexes, and hygienic daily catering packages with instant barcode meal passes.
            </p>
            
            <div className="hero-actions">
              <Link to="/accommodations" className="btn btn-primary btn-lg hero-cta-btn">
                <Search size={18} /> Find Accommodations
              </Link>
              <Link to="/meal-plans" className="btn btn-outline-white btn-lg hero-cta-btn-alt">
                <Utensils size={18} /> Browse Meal Plans
              </Link>
            </div>

            <div className="hero-trust-metrics">
              <div className="metric-item">
                <div className="metric-val">100%</div>
                <div className="metric-lbl">Verified Landlords</div>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <div className="metric-val">0%</div>
                <div className="metric-lbl">Zero Broker Scams</div>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <div className="metric-val">Instant</div>
                <div className="metric-lbl">Digital Meal ID</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <img 
                src={unistayHero} 
                alt="University students on modern campus living grounds" 
                className="hero-main-img"
              />
              <div className="hero-floating-card hero-floating-left">
                <div className="floating-icon-wrap floating-icon-blue">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <strong>5+ Top Campuses</strong>
                  <span>Walkable radius maps</span>
                </div>
              </div>
              <div className="hero-floating-card hero-floating-right">
                <div className="floating-icon-wrap floating-icon-orange">
                  <Coffee size={18} />
                </div>
                <div>
                  <strong>Digital Meal Pass</strong>
                  <code>MEAL-2026-X8F9</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LATEST UPDATED ACCOMMODATION PLACES (HORIZONTAL SCROLL) */}
      <section className="showcase-section bg-light-tint">
        <div className="container">
          <div className="showcase-header">
            <div className="showcase-titles">
              <span className="section-eyebrow">Verified Living Spaces</span>
              <h2>Latest Updated Accommodations</h2>
              <p>Freshly updated boarding places, hostels and annexes near universities</p>
            </div>
            <Link to="/accommodations" className="btn-explore-more">
              <span>Explore More</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="horizontal-scroll-container">
            {loadingShowcase ? (
              <div className="scroll-loading-msg">Loading featured accommodations...</div>
            ) : featuredAccommodations.length === 0 ? (
              <div className="scroll-empty-msg">No accommodations listed yet. Check back soon!</div>
            ) : (
              featuredAccommodations.map((acc) => (
                <Link 
                  key={acc.accommodation_id} 
                  to={`/accommodations/${acc.accommodation_id}`}
                  className="showcase-card acc-showcase-card"
                >
                  <div className="showcase-image-wrapper">
                    <img 
                      src={acc.image_urls?.[0] || acc.images?.[0] || acc.image_url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&auto=format&fit=crop&q=60'} 
                      alt={acc.title}
                      loading="lazy"
                    />
                    <span className="badge-tag featured-badge">
                      <Sparkles size={11} /> Featured
                    </span>
                    <span className="badge-price">
                      LKR {Number(acc.price_per_month).toLocaleString()} <small>/ mo</small>
                    </span>
                  </div>
                  <div className="showcase-body">
                    <div className="showcase-location">
                      <MapPin size={13} />
                      <span>{acc.university_name || acc.city || 'Near Campus'}</span>
                    </div>
                    <h3 className="showcase-title">{acc.title}</h3>
                    <div className="showcase-meta">
                      <span>{acc.room_type || 'Single/Shared'}</span>
                      <span className="meta-bullet">•</span>
                      <span>{acc.ac_status ? 'A/C' : 'Non-A/C'}</span>
                      <span className="meta-bullet">•</span>
                      <span className="meta-rooms">{acc.rooms_available || acc.total_rooms || 1} Rooms</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3. LATEST ADDED FOOD PLANS (HORIZONTAL SCROLL) */}
      <section className="showcase-section">
        <div className="container">
          <div className="showcase-header">
            <div className="showcase-titles">
              <span className="section-eyebrow">Nutritious Student Dining</span>
              <h2>Latest Added Food Plans</h2>
              <p>Hygienic catering subscriptions and daily meals by verified culinary providers</p>
            </div>
            <Link to="/meal-plans" className="btn-explore-more">
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="horizontal-scroll-container">
            {loadingShowcase ? (
              <div className="scroll-loading-msg">Loading top-rated meal plans...</div>
            ) : topMealPlans.length === 0 ? (
              <div className="scroll-empty-msg">No meal plans available yet. Check back soon!</div>
            ) : (
              topMealPlans.map((plan) => (
                <Link 
                  key={plan.meal_plan_id} 
                  to={`/meal-plans/${plan.meal_plan_id}`}
                  className="showcase-card meal-showcase-card"
                >
                  <div className="showcase-image-wrapper meal-img-wrapper">
                    <img 
                      src={plan.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} 
                      alt={plan.plan_name}
                      loading="lazy"
                    />
                    <span className="badge-tag top-rated-badge">
                      <Star size={11} fill="#f59e0b" color="#f59e0b" /> Top Rated
                    </span>
                    <span className="badge-price badge-price-green">
                      {Number(plan.price) > 0 ? `LKR ${Number(plan.price).toLocaleString()}` : 'Custom Menu'}
                    </span>
                  </div>
                  <div className="showcase-body">
                    <div className="showcase-location meal-provider-tag">
                      <Utensils size={13} />
                      <span>{plan.business_name || 'Verified Provider'}</span>
                    </div>
                    <h3 className="showcase-title">{plan.plan_name}</h3>
                    <p className="showcase-desc">
                      {plan.description ? plan.description.slice(0, 65) + '...' : 'Wholesome student catering with daily balance pass.'}
                    </p>
                    <div className="showcase-meta">
                      <span className="campus-badge">{plan.university_name || plan.city || 'Campus Delivery'}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3.5 SPOTLIGHT DINING BANNER */}
      <section className="dining-spotlight-section">
        <div className="container">
          <div className="dining-spotlight-card">
            <div className="dining-spotlight-img-wrap">
              <img src={unistayDining} alt="Student dining hall and meal plan catering" className="dining-spotlight-img" />
              <div className="dining-spotlight-overlay"></div>
            </div>
            <div className="dining-spotlight-content">
              <span className="dining-spotlight-badge">
                <Coffee size={14} /> Hygienic Campus Catering
              </span>
              <h2>Hassle-Free Daily Student Meals With Digital Barcodes</h2>
              <p>
                Subscribe once to wholesome breakfast, lunch, and dinner meal plans. Show your personalized Digital Meal ID on your phone at affiliated campus canteens and cafes for instant contactless redemption.
              </p>
              <div className="dining-spotlight-actions">
                <Link to="/meal-plans" className="btn btn-primary">
                  Browse Campus Menus <ArrowRight size={16} />
                </Link>
                <Link to="/vouchers" className="btn btn-outline">
                  View Meal Passes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. UNIVERSITY QUICK FILTERS */}
      <section className="university-section">
        <div className="container">
          <div className="section-title">
            <span className="section-eyebrow">Campus Directory</span>
            <h2>Explore Nearby Universities</h2>
            <p>Select your campus to filter accommodations within commuting distance</p>
          </div>

          <div className="uni-grid">
            {universities.map((uni) => (
              <Link 
                key={uni.code} 
                to={`/accommodations?city=${encodeURIComponent(uni.city)}`} 
                className="uni-card"
              >
                <div className="uni-card-top">
                  <div className="uni-icon">
                    <GraduationCap size={22} />
                  </div>
                  <span className="uni-tag">{uni.tag || uni.code.toUpperCase()}</span>
                </div>
                <div className="uni-info">
                  <h3>{uni.name}</h3>
                  <span className="uni-city">
                    <MapPin size={13} /> {uni.city}, Sri Lanka
                  </span>
                </div>
                <div className="uni-card-footer">
                  <span className="uni-badge-count">{uni.count}</span>
                  <div className="uni-arrow-wrap">
                    <ArrowRight size={16} className="uni-arrow" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CORE SYSTEM FEATURES */}
      <section className="features-section">
        <div className="container">
          <div className="section-title">
            <span className="section-eyebrow">Smart Platform Pillars</span>
            <h2>Everything You Need for Campus Living</h2>
            <p>Integrated solutions built specifically for Sri Lankan university students and providers</p>
          </div>

          <div className="features-grid">
            <div className="feature-card feature-card-teal">
              <div className="feature-card-glow"></div>
              <div className="feature-header">
                <div className="feature-icon feature-icon-teal">
                  <ShieldCheck size={26} />
                </div>
                <span className="feature-tag">Verified Safety</span>
              </div>
              <h3>Admin Verified Trust</h3>
              <p>Every Property Owner and Meal Provider undergoes manual admin verification before publishing listings.</p>
              <div className="feature-footer">
                <span className="feature-accent-link">Verified Landlords <ArrowRight size={14} /></span>
              </div>
            </div>

            <div className="feature-card feature-card-blue">
              <div className="feature-card-glow"></div>
              <div className="feature-header">
                <div className="feature-icon feature-icon-blue">
                  <MapPin size={26} />
                </div>
                <span className="feature-tag">Smart Radius</span>
              </div>
              <h3>Interactive Map Radius</h3>
              <p>Pinpoint accommodations close to lecture halls and transport hubs using Google Maps integration.</p>
              <div className="feature-footer">
                <span className="feature-accent-link">Explore Locations <ArrowRight size={14} /></span>
              </div>
            </div>

            <div className="feature-card feature-card-amber">
              <div className="feature-card-glow"></div>
              <div className="feature-header">
                <div className="feature-icon feature-icon-amber">
                  <QrCode size={26} />
                </div>
                <span className="feature-tag">Contactless</span>
              </div>
              <h3>Digital Meal ID Pass</h3>
              <p>Subscribe to breakfast, lunch, or dinner packages and redeem meals using unique barcode cards.</p>
              <div className="feature-footer">
                <span className="feature-accent-link">Instant Meal Passes <ArrowRight size={14} /></span>
              </div>
            </div>

            <div className="feature-card feature-card-indigo">
              <div className="feature-card-glow"></div>
              <div className="feature-header">
                <div className="feature-icon feature-icon-indigo">
                  <UserCheck size={26} />
                </div>
                <span className="feature-tag">Direct Contact</span>
              </div>
              <h3>Direct Requests</h3>
              <p>Request bookings directly without brokers, with transparent price limits and instant owner response updates.</p>
              <div className="feature-footer">
                <span className="feature-accent-link">Zero Brokerage <ArrowRight size={14} /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOUR-ROLE ARCHITECTURE OVERVIEW */}
      <section className="roles-section">
        <div className="container">
          <div className="section-title">
            <span className="section-eyebrow">Tailored Experiences</span>
            <h2>Designed for the Entire Community</h2>
            <p>Unified workflows tailored for Students, Owners, Providers, and Admins</p>
          </div>

          <div className="roles-grid">
            <div className="role-box role-box-student">
              <div className="role-box-glow"></div>
              <div className="role-box-header">
                <span className="role-number">01</span>
                <div className="role-icon-wrap">
                  <GraduationCap size={22} />
                </div>
              </div>
              <div className="role-title-wrap">
                <h3>Students</h3>
                <span className="role-badge">Campus Seekers</span>
              </div>
              <ul className="role-feature-list">
                <li><CheckCircle size={15} /> Search room annexes by city & price</li>
                <li><CheckCircle size={15} /> Book accommodation directly</li>
                <li><CheckCircle size={15} /> Digital Meal ID card barcode pass</li>
              </ul>
            </div>

            <div className="role-box role-box-owner">
              <div className="role-box-glow"></div>
              <div className="role-box-header">
                <span className="role-number">02</span>
                <div className="role-icon-wrap">
                  <Building2 size={22} />
                </div>
              </div>
              <div className="role-title-wrap">
                <h3>Property Owners</h3>
                <span className="role-badge">Verified Hosts</span>
              </div>
              <ul className="role-feature-list">
                <li><CheckCircle size={15} /> Upload photos via Cloudinary</li>
                <li><CheckCircle size={15} /> Set Google Maps coordinates</li>
                <li><CheckCircle size={15} /> Approve or reject student requests</li>
              </ul>
            </div>

            <div className="role-box role-box-provider">
              <div className="role-box-glow"></div>
              <div className="role-box-header">
                <span className="role-number">03</span>
                <div className="role-icon-wrap">
                  <Utensils size={22} />
                </div>
              </div>
              <div className="role-title-wrap">
                <h3>Meal Providers</h3>
                <span className="role-badge">Daily Dining</span>
              </div>
              <ul className="role-feature-list">
                <li><CheckCircle size={15} /> Create monthly meal plans</li>
                <li><CheckCircle size={15} /> Scan student meal passes</li>
                <li><CheckCircle size={15} /> Track daily redemption records</li>
              </ul>
            </div>

            <div className="role-box role-box-admin">
              <div className="role-box-glow"></div>
              <div className="role-box-header">
                <span className="role-number">04</span>
                <div className="role-icon-wrap">
                  <ShieldCheck size={22} />
                </div>
              </div>
              <div className="role-title-wrap">
                <h3>Administrators</h3>
                <span className="role-badge">Platform Trust</span>
              </div>
              <ul className="role-feature-list">
                <li><CheckCircle size={15} /> Verify provider & owner profiles</li>
                <li><CheckCircle size={15} /> Toggle account suspensions</li>
                <li><CheckCircle size={15} /> Live analytics & system reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION */}
      <section className="cta-section">
        <div className="cta-backdrop-glow"></div>
        <div className="container cta-container">
          <h2>Ready to simplify your university accommodation and dining?</h2>
          <p>Join UniStay today as a Student, Property Owner, or Meal Service Provider.</p>
          
          <div className="cta-buttons">
            <Link to="/register" className="btn cta-btn-primary">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn cta-btn-secondary">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
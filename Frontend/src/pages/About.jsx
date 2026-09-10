import { Link } from 'react-router-dom';
import { 
  Target, HeartHandshake, Sparkles, 
  ArrowRight, CheckCircle2 
} from 'lucide-react';
import './StaticPages.css';

export default function About() {
  return (
    <div className="static-page about-redesign">
      {/* 1. HERO BANNER */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <span className="badge-header">
              <Sparkles size={14} /> Sri Lanka's Premier Academic Housing & Dining Network
            </span>
            <h1 style={{ color: '#ffffff' }}>Revolutionizing Undergrad Living & Student Dining</h1>
            <p>
              UniStay bridges the gap between Sri Lankan university undergraduates, verified boarding house owners, and hygienic catering providers with zero broker exploitation.
            </p>
            <div className="hero-cta-btns">
              <Link to="/accommodations" className="btn btn-primary btn-lg">
                Explore Accommodations <ArrowRight size={18} />
              </Link>
              <Link to="/meal-plans" className="btn btn-outline-white btn-lg">
                Browse Meal Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KEY METRICS COUNTER */}
      <section className="about-stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-box">
              <h3>5+</h3>
              <p>State & Private Campuses</p>
            </div>
            <div className="stat-box">
              <h3>100%</h3>
              <p>Admin-Verified Listings</p>
            </div>
            <div className="stat-box">
              <h3>5 km</h3>
              <p>Commute Radius Search</p>
            </div>
            <div className="stat-box">
              <h3>0%</h3>
              <p>Broker Commission Fees</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container static-content">
        {/* 3. MISSION & PROBLEM STATEMENT */}
        <div className="grid-2-col mission-vision-grid">
          <div className="info-card highlight-card">
            <div className="card-icon-box danger-icon">
              <Target size={28} />
            </div>
            <h2>The Challenge Undergrads Face</h2>
            <p>
              Relocating for university across Colombo, Moratuwa, and islandwide traditionally forces students to navigate unreliable broker networks, misleading social media listings, unfair advance deposits, and unhygienic daily meal options.
            </p>
            <ul className="about-feature-list">
              <li><CheckCircle2 size={16} /> Predatory broker commissions & hidden costs</li>
              <li><CheckCircle2 size={16} /> Unverified safety, security, and house conditions</li>
              <li><CheckCircle2 size={16} /> Inconsistent meals and lack of portion transparency</li>
            </ul>
          </div>

          <div className="info-card highlight-card">
            <div className="card-icon-box success-icon">
              <HeartHandshake size={28} />
            </div>
            <h2>The UniStay Solution</h2>
            <p>
              UniStay provides a centralized, administrator-verified ecosystem where students discover verified boarding houses, browse spatial campus maps, subscribe to digital meal plans, and redeem meals with instant barcode passes.
            </p>
            <ul className="about-feature-list">
              <li><CheckCircle2 size={16} /> 100% Direct owner & provider communication</li>
              <li><CheckCircle2 size={16} /> Spatial distance calculations relative to universities</li>
              <li><CheckCircle2 size={16} /> Verified food passes and secure digital balance tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
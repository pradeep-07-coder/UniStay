import { Link } from 'react-router-dom';
import { 
  Mail, Phone, MapPin, ShieldCheck, Utensils, 
  Home, QrCode, Globe, Clock, CheckCircle2 
} from 'lucide-react';
import unistayLogo from '../assets/unistay_logo.jpg';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-container" id="unistay-footer">
      <div className="footer-content">
        {/* COL 1: ABOUT UNISTAY */}
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <div className="brand-logo-badge">
              <img src={unistayLogo} alt="UniStay Logo" className="footer-logo-img" />
            </div>
            <span>UniStay <small>Sri Lanka</small></span>
          </div>
          <p className="brand-desc">
            UniStay is Sri Lanka's dedicated university student living and catering ecosystem. We empower undergraduates to find safe, verified boarding places, subscribe to hygienic meal plans, and eliminate broker scams.
          </p>
          <div className="accreditation-badge">
            <CheckCircle2 size={16} className="badge-check" />
            <span>Serving 5+ State & Private Universities</span>
          </div>
        </div>

        {/* COL 2: QUICK NAVIGATION */}
        <div className="footer-col">
          <h4>Quick Navigation</h4>
          <ul>
            <li><Link to="/">Home Overview</Link></li>
            <li><Link to="/accommodations">Find Accommodations</Link></li>
            <li><Link to="/meal-plans">Browse Meal Plans</Link></li>
            <li><Link to="/vouchers">Student Food Vouchers</Link></li>
            <li><Link to="/about">About UniStay</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
            <li><Link to="/login">Sign In to Portal</Link></li>
          </ul>
        </div>

        {/* COL 3: SERVICES OFFERED */}
        <div className="footer-col">
          <h4>Services Offered</h4>
          <ul>
            <li><span className="svc-bullet"><Home size={14} /> Student Hostel Listings</span></li>
            <li><span className="svc-bullet"><Utensils size={14} /> Daily Meal Subscriptions</span></li>
            <li><span className="svc-bullet"><QrCode size={14} /> Barcode Voucher Passes</span></li>
            <li><span className="svc-bullet"><ShieldCheck size={14} /> Owner Background Verification</span></li>
            <li><span className="svc-bullet"><Globe size={14} /> Interactive Campus Radius Maps</span></li>
            <li><span className="svc-bullet"><Clock size={14} /> Real-time Booking Updates</span></li>
          </ul>
        </div>

        {/* COL 4: CONTACT & CAMPUS LOCATIONS */}
        <div className="footer-col contact-col">
          <h4>Campuses & Support</h4>
          <div className="contact-details">
            <p><MapPin size={16} className="contact-icon" /> University of Moratuwa, Katubedda</p>
            <p><MapPin size={16} className="contact-icon" /> University of Colombo, Cinnamon Gardens</p>
            <p><Phone size={16} className="contact-icon" /> +94 (0) 11 234 5678 (Helpdesk)</p>
            <p><Mail size={16} className="contact-icon" /> support@unistay.lk</p>
            <p><Clock size={16} className="contact-icon" /> Mon - Sat: 8:00 AM - 7:00 PM</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} UniStay Sri Lanka Academic Housing & Catering System. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <Link to="/about">Privacy Policy</Link>
            <span className="dot-sep">•</span>
            <Link to="/about">Terms of Service</Link>
            <span className="dot-sep">•</span>
            <Link to="/contact">Help & FAQs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
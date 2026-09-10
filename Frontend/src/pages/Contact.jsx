import { useState } from 'react';
import API from '../services/api';
import { 
  Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, 
  Clock, ShieldCheck, Sparkles, User, ArrowRight, HelpCircle 
} from 'lucide-react';
import './StaticPages.css';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/inquiries', formData);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      }, 4000);
    } catch (err) {
      console.error('Submit Inquiry Error:', err);
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="static-page contact-page-enhanced">
      {/* 1. HERO HEADER */}
      <div className="page-header contact-hero">
        <div className="container">
          <div className="contact-hero-inner">
            <span className="badge-header">
              <Sparkles size={14} /> We're Here to Help
            </span>
            <h1 style={{ color: '#ffffff' }}>Contact the UniStay Support Team</h1>
            <p className="contact-hero-subtitle">
              Have questions about accommodation listings, meal passes, or provider verification? Our dedicated university support team is available 7 days a week.
            </p>
            <div className="hero-trust-badges">
              <span className="trust-pill">
                <Clock size={13} /> Quick Response: Under 2 Hours
              </span>
              <span className="trust-pill">
                <ShieldCheck size={13} /> Verified University Support
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container static-content">
        <div className="contact-layout">
          {/* LEFT: Contact Information & Hub */}
          <div className="contact-info-col">
            <div className="contact-info-header">
              <h2>Get in Touch</h2>
              <p className="contact-desc">
                Whether you are a student searching for verified boarding, an owner listing an annex, or a food catering provider, our team provides comprehensive guidance.
              </p>
            </div>

            <div className="contact-cards-list">
              {/* Main Campus Office */}
              <div className="contact-card-item">
                <div className="contact-card-icon icon-blue">
                  <MapPin size={22} />
                </div>
                <div className="contact-card-body">
                  <span className="card-mini-label">CAMPUS HEADQUARTERS</span>
                  <strong>Main University Liaison Office</strong>
                  <p>Bandaranayake Mawatha, Moratuwa 10400, Sri Lanka</p>
                  <span className="contact-hours-badge">
                    <Clock size={12} /> Mon - Sat: 8:30 AM - 6:00 PM
                  </span>
                </div>
              </div>

              {/* Email Support */}
              <div className="contact-card-item">
                <div className="contact-card-icon icon-indigo">
                  <Mail size={22} />
                </div>
                <div className="contact-card-body">
                  <span className="card-mini-label">DIGITAL DESK &amp; INQUIRIES</span>
                  <strong>support@unistay.lk</strong>
                  <p>Inquiries, landlord verification, and payment assistance</p>
                  <a href="mailto:support@unistay.lk" className="contact-card-action">
                    <span>Send Direct Email</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>

              {/* Phone Helpline */}
              <div className="contact-card-item">
                <div className="contact-card-icon icon-emerald">
                  <Phone size={22} />
                </div>
                <div className="contact-card-body">
                  <span className="card-mini-label">STUDENT HELPLINE</span>
                  <strong>+94 11 265 0301 / +94 77 123 4567</strong>
                  <p>Toll-free hotline for urgent boarding issues &amp; onboarding</p>
                  <a href="tel:+94112650301" className="contact-card-action">
                    <span>Call Hotline Now</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Assistance Help Box */}
            <div className="quick-help-box">
              <div className="quick-help-icon">
                <HelpCircle size={20} />
              </div>
              <div className="quick-help-content">
                <strong>Need Immediate Assistance?</strong>
                <p>Check your student or provider dashboard for live booking statuses, voucher balances, and instant notification alerts.</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Modern Contact Form */}
          <div className="contact-form-col">
            <div className="form-card modern-contact-card">
              <div className="form-card-header">
                <div className="form-header-icon">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3>Send Us a Message</h3>
                  <p className="form-header-sub">Fill out the form below and an advisor will respond promptly</p>
                </div>
              </div>

              {submitted && (
                <div className="status-banner success animate-pop" style={{ marginBottom: '1.25rem' }}>
                  <CheckCircle size={20} />
                  <div>
                    <strong>Message Delivered Successfully!</strong>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>Thank you! Our university support team will review your inquiry and get back to you shortly.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="modern-contact-form">
                <div className="form-group-contact">
                  <label>
                    <User size={15} /> Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nimal Perera"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group-contact">
                  <label>
                    <Mail size={15} /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@university.lk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group-contact">
                  <label>
                    <Sparkles size={15} /> Inquiry Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="styled-select"
                  >
                    <option value="General Inquiry">General Student Inquiry</option>
                    <option value="Property Verification">Property Owner Verification &amp; Listings</option>
                    <option value="Meal Provider Partnership">Meal Provider Partnership &amp; Menus</option>
                    <option value="Technical Support">Technical Support / Digital QR Pass</option>
                  </select>
                </div>

                <div className="form-group-contact">
                  <label>
                    <MessageSquare size={15} /> Detailed Message
                  </label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Describe your inquiry, university campus, or question in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-block btn-send-contact" 
                  disabled={submitting}
                >
                  <Send size={16} /> 
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
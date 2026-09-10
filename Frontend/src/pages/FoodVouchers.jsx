import { useNavigate } from 'react-router-dom';
import { Ticket, ShieldCheck, Zap, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import './FoodVouchers.css';

export default function FoodVouchers() {
  const navigate = useNavigate();

  const voucherTiers = [
    {
      id: 'basic',
      tier_name: 'Basic',
      price: 5000,
      description: 'Ideal for quick weekly snacks & individual daily meals on campus.',
      badgeColor: '#0284c7',
      isPopular: false,
      features: [
        'LKR 5,000 Stored Dining Credit',
        'Valid at all verified campus kitchens',
        'Auto-deducts per order until zero',
        'Instant digital pass in your portal',
      ]
    },
    {
      id: 'standard',
      tier_name: 'Standard',
      price: 10000,
      description: 'Best value for regular lunch & dinner meal subscriptions across semesters.',
      badgeColor: '#16a34a',
      isPopular: true,
      features: [
        'LKR 10,000 Stored Dining Credit',
        'Valid at all verified campus kitchens',
        'Auto-deducts per order until zero',
        'Priority kitchen preparation',
        'Instant digital pass in your portal',
      ]
    },
    {
      id: 'premium',
      tier_name: 'Premium',
      price: 15000,
      description: 'Maximum convenience for full 3-meal daily student dining throughout the month.',
      badgeColor: '#9333ea',
      isPopular: false,
      features: [
        'LKR 15,000 Stored Dining Credit',
        'Valid at all verified campus kitchens',
        'Auto-deducts per order until zero',
        'Full 3-meal flexible dining balance',
        'Instant digital pass in your portal',
      ]
    },
  ];

  const handleBuyVoucher = (voucher) => {
    navigate('/payment', {
      state: {
        payment_type: 'food_voucher',
        reference_id: voucher.price,
        title: `Food Voucher - ${voucher.tier_name} Tier`,
        amount: voucher.price,
        period: 'Stored Balance Voucher Pass',
        tier_name: voucher.tier_name,
      },
    });
  };

  return (
    <div className="vouchers-page-wrapper">
      <div className="container vouchers-page">
        {/* HEADER HERO */}
        <div className="vouchers-header">
          <div className="vouchers-badge-pill">
            <Sparkles size={14} />
            <span>Digital Dining Pass</span>
          </div>
          <h1>UniStay Student Food Vouchers</h1>
          <p>Preload your campus dining wallet. Present your digital code at any partner kitchen for cashless, discounted student meals.</p>
        </div>

        {/* PRICING GRID */}
        <div className="vouchers-grid">
          {voucherTiers.map((v) => (
            <div 
              key={v.id} 
              className={`voucher-pricing-card ${v.isPopular ? 'popular-tier' : ''}`}
            >
              {v.isPopular && (
                <div className="popular-ribbon">
                  <span>MOST POPULAR</span>
                </div>
              )}

              <div className="tier-header-modern">
                <div className="tier-icon-box" style={{ background: `${v.badgeColor}15`, color: v.badgeColor }}>
                  <Ticket size={24} />
                </div>
                <div>
                  <span className="tier-badge-label" style={{ color: v.badgeColor }}>
                    {v.tier_name} Tier
                  </span>
                  <h3 className="tier-name-title">{v.tier_name} Pass</h3>
                </div>
              </div>

              <div className="voucher-amount-section">
                <div className="amount-row">
                  <span className="currency-symbol">LKR</span>
                  <span className="amount-number">{v.price.toLocaleString()}</span>
                </div>
                <span className="amount-subtext">Stored balance • Zero fees</span>
              </div>

              <p className="voucher-desc">{v.description}</p>

              <div className="tier-divider" />

              <ul className="voucher-features-list">
                {v.features.map((feat, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} className="feature-check-icon" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleBuyVoucher(v)} 
                className={`btn btn-block btn-buy-voucher ${v.isPopular ? 'btn-primary' : 'btn-outline'}`}
              >
                <span>Choose {v.tier_name} Pass</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* TRUST BANNER */}
        <div className="vouchers-trust-strip">
          <div className="trust-item">
            <ShieldCheck size={20} className="trust-icon" />
            <div>
              <strong>100% Student Protected</strong>
              <p>Refundable remaining balance or roll-over next semester</p>
            </div>
          </div>
          <div className="trust-item">
            <Zap size={20} className="trust-icon" />
            <div>
              <strong>Instant Digital Activation</strong>
              <p>Pass generated directly to your student dashboard upon payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CreditCard, ShieldCheck, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import './PaymentPage.css';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const paymentData = location.state || {
    payment_type: 'accommodation_rent',
    reference_id: 1,
    title: 'Monthly Accommodation Rent Pass',
    amount: 25000,
    period: '1 Month',
  };

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [cardData, setCardData] = useState({
    card_number: '',
    exp_date: '',
    cvv: '',
    card_holder: '',
  });

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await API.post('/payments/process', {
        payment_type: paymentData.payment_type,
        reference_id: paymentData.reference_id,
        amount: paymentData.amount,
        payment_details: { 
          card_type: 'Visa Credit Card (Demo)',
          tier_name: paymentData.tier_name || 'Standard',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        const targetTab = paymentData.payment_type === 'food_voucher' ? 'vouchers' : 'accommodations';
        navigate(`/student/dashboard?tab=${targetTab}`);
      }, 2000);
    } catch (err) {
      console.error('Payment Error:', err);
      setErrorMsg(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container payment-page">
      <div className="payment-card">
        <div className="payment-header">
          <div className="payment-header-top">
            <CreditCard size={28} className="payment-icon" />
            <h2>UniStay Secure Checkout</h2>
          </div>
          <p>Instant activation for academic accommodation and food subscriptions</p>
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.88rem'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="payment-success">
            <CheckCircle2 size={48} className="success-icon" />
            <h3>Payment Completed!</h3>
            <p>Your transaction was recorded and your 1-month pass is now active.</p>
          </div>
        ) : (
          <div className="payment-grid">
            <div className="summary-col">
              <h4>Order Summary</h4>
              <p className="summary-title">{paymentData.title}</p>
              <p className="summary-period">Validity: <strong>{paymentData.period}</strong></p>
              <div className="price-total">
                <span>Total Amount:</span>
                <strong>LKR {parseFloat(paymentData.amount).toLocaleString()}</strong>
              </div>
            </div>

            <form onSubmit={handleProcessPayment} className="form-col">
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dilan Perera"
                  value={cardData.card_holder}
                  onChange={(e) => setCardData({ ...cardData, card_holder: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4242 •••• •••• 4242"
                  value={cardData.card_number}
                  onChange={(e) => setCardData({ ...cardData, card_number: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={cardData.exp_date}
                    onChange={(e) => setCardData({ ...cardData, exp_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    required
                    placeholder="CVV (e.g. 123)"
                    maxLength="4"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                <Lock size={16} /> {loading ? 'Securing Transaction...' : `Pay LKR ${parseFloat(paymentData.amount).toLocaleString()}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
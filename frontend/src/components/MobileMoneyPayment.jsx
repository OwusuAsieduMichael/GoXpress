import { useState, useEffect } from 'react';
import api from '../api';

const MobileMoneyPayment = ({ saleId, amount, onSuccess, onCancel }) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentReference, setPaymentReference] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, pending, success, failed
  const [statusMessage, setStatusMessage] = useState('');

  // Poll for payment status
  useEffect(() => {
    if (!paymentReference || paymentStatus !== 'pending') return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/payments/status/${paymentReference}`);
        const { status } = response.data;

        if (status === 'completed') {
          setPaymentStatus('success');
          setStatusMessage('Payment successful! 🎉');
          clearInterval(pollInterval);
          
          // Call success callback after a short delay
          setTimeout(() => {
            onSuccess(paymentReference);
          }, 1500);
        } else if (status === 'failed') {
          setPaymentStatus('failed');
          setStatusMessage('Payment failed. Please try again.');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === 'pending') {
        setPaymentStatus('failed');
        setStatusMessage('Payment timeout. Please try again.');
      }
    }, 300000); // 5 minutes

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [paymentReference, paymentStatus, onSuccess]);

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);
    
    // Format as 0XX XXX XXXX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const validatePhone = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Must be 10 digits starting with 0
    if (cleaned.length !== 10) {
      return 'Phone number must be 10 digits';
    }
    
    if (!cleaned.startsWith('0')) {
      return 'Phone number must start with 0';
    }
    
    // Check for valid Ghana network prefixes
    const prefix = cleaned.substring(0, 3);
    const validPrefixes = [
      '024', '054', '055', '059', // MTN
      '020', '050', // Vodafone
      '027', '057', '026', '056'  // AirtelTigo
    ];
    
    if (!validPrefixes.includes(prefix)) {
      return 'Invalid network prefix. Use MTN, Vodafone, or AirtelTigo number';
    }
    
    return null;
  };

  const handleInitiatePayment = async () => {
    // Validate phone
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/payments/momo/initiate', {
        saleId,
        amount,
        phone: phone.replace(/\s/g, ''), // Remove spaces
        email: email || undefined
      });

      if (response.data.success) {
        setPaymentReference(response.data.payment.reference);
        setPaymentStatus('pending');
        setStatusMessage('Check your phone to approve the payment...');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const getNetworkFromPhone = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 3) return '';
    
    const prefix = cleaned.substring(0, 3);
    
    if (['024', '054', '055', '059'].includes(prefix)) return 'MTN';
    if (['020', '050'].includes(prefix)) return 'Vodafone';
    if (['027', '057', '026', '056'].includes(prefix)) return 'AirtelTigo';
    
    return '';
  };

  const network = getNetworkFromPhone(phone);

  return (
    <div className="momo-payment-container">
      <div className="momo-payment-header">
        <h3>Mobile Money Payment</h3>
        <p className="momo-amount">Amount: GH₵ {parseFloat(amount).toFixed(2)}</p>
      </div>

      {paymentStatus === 'idle' && (
        <div className="momo-payment-form">
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="024 123 4567"
              disabled={loading}
              className={error ? 'input-error' : ''}
              maxLength={12}
            />
            {network && (
              <span className="network-badge">{network}</span>
            )}
            {error && <span className="error-message">{error}</span>}
            <small className="input-hint">
              Supported: MTN, Vodafone, AirtelTigo
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (Optional)</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              disabled={loading}
            />
            <small className="input-hint">
              For payment receipt
            </small>
          </div>

          <div className="momo-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInitiatePayment}
              className="btn-primary"
              disabled={loading || !phone}
            >
              {loading ? 'Processing...' : 'Charge Customer'}
            </button>
          </div>
        </div>
      )}

      {paymentStatus === 'pending' && (
        <div className="momo-payment-pending">
          <div className="spinner"></div>
          <h4>Waiting for Payment Approval</h4>
          <p>{statusMessage}</p>
          <p className="momo-phone-display">
            📱 {phone} ({network})
          </p>
          <div className="momo-instructions">
            <p><strong>Customer should:</strong></p>
            <ol>
              <li>Check their phone for MoMo prompt</li>
              <li>Enter their MoMo PIN</li>
              <li>Approve the payment</li>
            </ol>
          </div>
          <p className="momo-reference">
            Reference: <code>{paymentReference}</code>
          </p>
        </div>
      )}

      {paymentStatus === 'success' && (
        <div className="momo-payment-success">
          <div className="success-icon">✓</div>
          <h4>Payment Successful!</h4>
          <p>{statusMessage}</p>
          <p className="momo-amount-paid">GH₵ {parseFloat(amount).toFixed(2)}</p>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="momo-payment-failed">
          <div className="error-icon">✗</div>
          <h4>Payment Failed</h4>
          <p>{statusMessage || error}</p>
          <div className="momo-actions">
            <button
              type="button"
              onClick={() => {
                setPaymentStatus('idle');
                setPaymentReference(null);
                setError('');
                setStatusMessage('');
              }}
              className="btn-primary"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMoneyPayment;

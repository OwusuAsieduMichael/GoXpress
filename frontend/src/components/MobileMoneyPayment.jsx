import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

const MobileMoneyPayment = ({ saleId, amount, onSuccess, onCancel }) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState('mtn'); // mtn, vod, tgo
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentReference, setPaymentReference] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, otp_required, processing, success, failed
  const [statusMessage, setStatusMessage] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const startPolling = (ref) => {
    let pollCount = 0;
    const maxPolls = 60; // Poll for up to 5 minutes (60 * 5 seconds)
    
    const interval = setInterval(async () => {
      try {
        pollCount++;
        const response = await api.get(`/payments/status/${ref}`);
        
        console.log(`📊 Poll ${pollCount}: Payment status:`, response.data.status);
        
        if (response.data.status === 'success' || response.data.status === 'completed') {
          clearInterval(interval);
          setPaymentStatus('success');
          setStatusMessage('Payment successful! 🎉');
          setTimeout(() => {
            onSuccess({ reference: ref });
          }, 1500);
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          setPaymentStatus('failed');
          setStatusMessage('Payment failed. Customer may have declined or cancelled.');
        } else if (pollCount >= maxPolls) {
          clearInterval(interval);
          setPaymentStatus('failed');
          setStatusMessage('Payment timeout. Please try again.');
        }
      } catch (err) {
        console.error('Status check error:', err);
        if (pollCount >= maxPolls) {
          clearInterval(interval);
          setPaymentStatus('failed');
          setStatusMessage('Could not verify payment status.');
        }
      }
    }, 5000); // Poll every 5 seconds
    
    setPollingInterval(interval);
  };

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
    
    // Auto-detect provider from phone prefix
    const cleaned = formatted.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      const prefix = cleaned.substring(0, 3);
      if (['024', '054', '055', '059', '053'].includes(prefix)) {
        setProvider('mtn');
      } else if (['020', '050'].includes(prefix)) {
        setProvider('vod');
      } else if (['027', '057', '026', '056'].includes(prefix)) {
        setProvider('tgo');
      }
    }
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
    
    // No strict prefix validation - cashier selects provider
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
        email: email || undefined,
        provider: provider // Send selected provider
      });

      if (response.data.success) {
        setPaymentReference(response.data.payment.reference);
        
        // Check if OTP is required or if it's direct approval
        if (response.data.payment.requiresOTP) {
          setPaymentStatus('otp_required');
          setStatusMessage('Customer has received SMS with code. Enter the code below.');
        } else {
          // Direct MoMo prompt - customer approves on their phone
          setPaymentStatus('pending');
          setStatusMessage('Customer should approve payment on their phone...');
          // Start polling for status
          startPolling(response.data.payment.reference);
        }
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to initiate payment. Please try again.';
      console.error('Error details:', err.response?.data);
      setError(errorMessage);
      setPaymentStatus('failed');
      setStatusMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOTP = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter the complete code');
      return;
    }

    setLoading(true);
    setError('');
    setPaymentStatus('processing');
    setStatusMessage('Verifying code and processing payment...');

    try {
      const response = await api.post('/payments/momo/submit-otp', {
        reference: paymentReference,
        otp: otp
      });

      console.log('OTP submission response:', response.data);

      // Check the actual status from response
      if (response.data.success && (response.data.status === 'success' || response.data.status === 'completed')) {
        // Payment completed successfully
        setPaymentStatus('success');
        setStatusMessage('Payment successful! 🎉');
        setLoading(false);
        
        setTimeout(() => {
          onSuccess({ reference: paymentReference });
        }, 1500);
      } else if (response.data.status === 'pending' || response.data.status === 'ongoing' || response.data.status === 'send_birthday') {
        // Payment is still processing - customer needs to enter PIN
        setPaymentStatus('pending');
        setStatusMessage('Waiting for customer to enter their MoMo PIN...');
        setLoading(false);
        
        // Start polling for status updates
        startPolling(paymentReference);
      } else if (response.data.status === 'failed') {
        // Payment actually failed
        setPaymentStatus('failed');
        setStatusMessage(response.data.message || 'Payment failed. Customer may have declined or entered wrong PIN.');
        setLoading(false);
      } else {
        // Unknown status - treat as pending and poll
        setPaymentStatus('pending');
        setStatusMessage('Processing payment... Please wait.');
        setLoading(false);
        startPolling(paymentReference);
      }
    } catch (err) {
      console.error('OTP submission error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to submit code. Please try again.';
      setError(errorMsg);
      setStatusMessage(errorMsg);
      setPaymentStatus('otp_required');
      setLoading(false);
    }
  };

  const getNetworkFromPhone = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 3) return '';
    
    const prefix = cleaned.substring(0, 3);
    
    if (['024', '054', '055', '059', '053'].includes(prefix)) return 'MTN';
    if (['020', '050'].includes(prefix)) return 'Vodafone';
    if (['027', '057', '026', '056'].includes(prefix)) return 'AirtelTigo';
    
    return '';
  };

  const getProviderName = (code) => {
    const providers = {
      'mtn': 'MTN',
      'vod': 'Vodafone',
      'tgo': 'AirtelTigo'
    };
    return providers[code] || code;
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
          <div style={{ 
            background: '#e7f3ff', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: 0, fontWeight: '500' }}>
              📱 <strong>How it works:</strong>
            </p>
            <p style={{ margin: '8px 0 0 0' }}>
              Customer will receive a prompt on their phone. Enter your <strong>MoMo PIN</strong> to approve the payment.
            </p>
          </div>

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
              Enter customer's 10-digit phone number
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="provider">Network Provider *</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="mtn">MTN Mobile Money</option>
              <option value="vod">Vodafone Cash</option>
              <option value="tgo">AirtelTigo Money</option>
            </select>
            <small className="input-hint">
              {network && network !== getProviderName(provider) && (
                <span style={{ color: '#ff6b6b' }}>
                  ⚠️ Phone prefix suggests {network}
                </span>
              )}
              {network && network === getProviderName(provider) && (
                <span style={{ color: '#51cf66' }}>
                  ✓ Matches phone prefix
                </span>
              )}
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

      {paymentStatus === 'otp_required' && (
        <div className="momo-payment-otp">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h4>📱 Customer Received SMS</h4>
            <p className="momo-phone-display" style={{ fontSize: '16px', margin: '12px 0' }}>
              {phone} ({network})
            </p>
          </div>
          
          <div style={{ 
            background: '#fff3cd', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>
              📲 Ask customer for the code from SMS
            </p>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Customer should tell you the 6-digit code they received
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="otp" style={{ fontWeight: 'bold' }}>Enter Code from Customer *</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              placeholder="123456"
              disabled={loading}
              maxLength={6}
              style={{
                fontSize: '24px',
                textAlign: 'center',
                letterSpacing: '8px',
                fontWeight: 'bold'
              }}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <div className="momo-actions">
            <button
              type="button"
              onClick={() => {
                setPaymentStatus('idle');
                setPaymentReference(null);
                setOtp('');
                setError('');
              }}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitOTP}
              className="btn-primary"
              disabled={loading || !otp || otp.length < 4}
            >
              {loading ? 'Verifying...' : 'Submit Code'}
            </button>
          </div>

          <p style={{ marginTop: '16px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
            Reference: <code>{paymentReference}</code>
          </p>
        </div>
      )}

      {paymentStatus === 'processing' && (
        <div className="momo-payment-processing">
          <div className="spinner"></div>
          <h4>⏳ Processing Payment...</h4>
          <p>{statusMessage}</p>
          <p style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
            Reference: <code>{paymentReference}</code>
          </p>
          <p style={{ marginTop: '8px', fontSize: '13px', color: '#888' }}>
            Please wait while we verify the payment with Paystack...
          </p>
        </div>
      )}

      {paymentStatus === 'pending' && (
        <div className="momo-payment-pending">
          <div className="spinner"></div>
          <h4>⏳ Waiting for Customer Approval</h4>
          <p className="momo-phone-display" style={{ fontSize: '18px', margin: '16px 0' }}>
            📱 {phone} ({network})
          </p>
          
          <div style={{ 
            background: '#fff3cd', 
            padding: '20px', 
            borderRadius: '8px',
            marginTop: '20px',
            textAlign: 'left'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '12px' }}>
              📲 Customer Instructions:
            </p>
            <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li><strong>Check your phone</strong> - You should receive a Mobile Money prompt</li>
              <li><strong>Enter your MoMo PIN</strong> to approve the payment</li>
              <li><strong>Wait a moment</strong> - Payment will be confirmed automatically</li>
            </ol>
            
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: '#d1ecf1',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <strong>💡 Note:</strong> The system is automatically checking payment status every 5 seconds.
            </div>
          </div>

          <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
            Reference: <code>{paymentReference}</code>
          </p>

          <button
            type="button"
            onClick={() => {
              if (pollingInterval) clearInterval(pollingInterval);
              setPaymentStatus('idle');
              setPaymentReference(null);
              setError('');
              setStatusMessage('');
            }}
            className="btn-secondary"
            style={{ marginTop: '20px' }}
          >
            Cancel
          </button>
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
          <p style={{ color: '#666', marginTop: '12px' }}>{statusMessage || error}</p>
          {error && error !== statusMessage && (
            <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>{error}</p>
          )}
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

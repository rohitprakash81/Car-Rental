import { paymentApi } from './api';

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async ({ bookingId, user, onSuccess, onError }) => {
  try {
    const isLoaded = await loadRazorpayScript();

    // 1. Create order on Spring Boot backend
    const orderRes = await paymentApi.createOrder(bookingId);
    const { orderId, amount, currency, keyId } = orderRes.data;

    if (!isLoaded) {
      if (onError) {
        onError(
          'Razorpay checkout script could not be loaded. Please ensure you have an active internet connection and disable any adblockers.'
        );
      }
      return;
    }

    const options = {
      key: keyId || 'rzp_test_placeholderKey123',
      amount: amount,
      currency: currency || 'INR',
      name: 'DrivePrime Rentals',
      description: `Car Rental Booking #${bookingId}`,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100&h=100&fit=crop',
      order_id: orderId,
      handler: async function (response) {
        try {
          // 2. Send cryptographic signature to Spring Boot backend for HMAC SHA256 validation
          const verifyRes = await paymentApi.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          if (onSuccess) onSuccess(verifyRes.data);
        } catch (err) {
          if (onError)
            onError(err.response?.data?.message || 'Payment signature verification failed.');
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phoneNumber || '9999999999',
      },
      notes: {
        bookingId: bookingId.toString(),
      },
      theme: {
        color: '#4f46e5',
      },
      modal: {
        ondismiss: function () {
          if (onError) onError('Payment window was dismissed.');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    if (onError)
      onError(err.response?.data?.message || err.message || 'Failed to initiate checkout.');
  }
};

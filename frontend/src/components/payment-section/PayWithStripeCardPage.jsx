import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function StripeForm({ orderPayload, totalCost }) {
  const stripe = useStripe();
  const elements = useElements();
  const { token: authToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // 1. Create PaymentIntent on backend
      const resp = await axios.post(
        `${backendUrl}/create-stripe-payment-intent/`,
        { amount: totalCost },
        { headers: { Authorization: `Token ${authToken}` } }
      );

      const clientSecret = resp.data.clientSecret;

      // 2. Confirm card payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        // 3. Build order payload with payment_status: "completed"
        const completedPayload = {
          ...orderPayload,
          payment_method: "stripe",
          payment_status: "completed"
        };

        // 4. Create order in backend
        const orderRes = await axios.post(`${API_BASE_URL}/orders/`, completedPayload, {
          headers: { Authorization: `Token ${authToken}` },
        });

        toast.success("Payment successful, order placed!");
        navigate(`/order-confirmation/${orderRes.data.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Stripe payment failed.");
    } finally {
      setLoading(false);  // End loading regardless of success or failure
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-12 bg-white/90 rounded-3xl shadow-xl p-8 border-2 border-blue-200"
    >
      <h2 className="text-2xl font-extrabold mb-6 text-gray-900 text-center">
        Enter your card details
      </h2>
      <div className="mb-8 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-3 font-bold text-lg text-white rounded-lg shadow-lg transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
    bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
    ${loading ? 'cursor-wait' : ''}`}
      >
        {loading ? "Processing..." : `Pay Rs. ${totalCost}`}
      </button>
    </form>
  );
}

export default function PayWithCardPage() {
  const location = useLocation();
  const { orderPayload, totalCost } = location.state || {};

  if (!orderPayload) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 text-center text-red-600 font-semibold">
        No order data found. Please return to checkout.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripeForm orderPayload={orderPayload} totalCost={totalCost} />
    </Elements>);
}
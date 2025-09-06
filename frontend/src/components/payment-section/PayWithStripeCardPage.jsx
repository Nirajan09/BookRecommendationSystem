import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const stripePromise = loadStripe("pk_test_51Ru39zDDPpxrz2C9CfNxjLpKgpTt3YYL6BuHXm5BBcXEHZRoXJeIsWzL1LBxhW1JaFAf90ubPlv6Svaq7HuSmgTz00upC1kfIJ");
const API_BASE_URL = "http://localhost:8000";

function StripeForm({ orderPayload, totalCost }) {
  const stripe = useStripe();
  const elements = useElements();
  const { token: authToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    try {
      // 1. Create PaymentIntent on backend
      const resp = await axios.post(
        `${API_BASE_URL}/create-stripe-payment-intent/`,
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
          payment_status: "completed" // REQUIRED for backend to accept Stripe orders
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Enter your card details</h2>
      <div className="mb-4 p-3 border rounded">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button className="btn btn-primary w-full">Pay Rs. {totalCost}</button>
    </form>
  );
}

export default function PayWithCardPage() {
  const location = useLocation();
  const { orderPayload, totalCost } = location.state || {};

  if (!orderPayload) {
    return <div>No order data found. Please return to checkout.</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <StripeForm orderPayload={orderPayload} totalCost={totalCost} />
    </Elements>
  );
}

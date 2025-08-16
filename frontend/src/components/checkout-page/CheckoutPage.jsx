import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8000";

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard Delivery", cost: 5, eta: "3-5 business days" },
  { id: "express", label: "Express Delivery", cost: 15, eta: "1-2 business days" },
  { id: "pickup", label: "Store Pickup", cost: 0, eta: "Ready within 24 hrs" },
];

const PAYMENT_METHODS = [
  { id: "stripe", label: "Credit/Debit Card (Stripe)" },
  { id: "esewa", label: "E-Sewa" },
  { id: "cash_on_delivery", label: "Cash on Delivery" },
];

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token: authToken } = useAuth();
  const cartItems = location.state?.items || [];

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{7,15}$/;

  const itemsSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.book_detail.price) * item.quantity,
    0
  );
  const shippingCost = SHIPPING_OPTIONS.find(opt => opt.id === shippingMethod)?.cost || 0;
  const totalCost = (itemsSubtotal + shippingCost).toFixed(2);

  const canSubmit = address.trim().length > 5 && phoneRegex.test(phone) && emailRegex.test(email);

  useEffect(() => {
    if (!cartItems.length) {
      toast.error("No items for checkout.");
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please fill in all details correctly.");
      return;
    }

    const orderPayload = {
      address,
      phone,
      email,
      shipping_method: shippingMethod,
      payment_method: paymentMethod,
      shipping_cost: shippingCost,
      total: totalCost,
      items: cartItems.map(item => ({
        book: item.book_detail.id,
        quantity: item.quantity,
        price: Number(item.book_detail.price).toFixed(2),
      })),
    };

    if (paymentMethod === "cash_on_delivery") {
      setLoading(true);
      axios.post(`${API_BASE_URL}/orders/`, orderPayload, {
        headers: { Authorization: `Token ${authToken}` },
      })
        .then(res => {
          toast.success("Order placed successfully!");
          navigate(`/order-confirmation/${res.data.id}`);

        })
        .catch(err => toast.error(err.response?.data?.detail || "Order failed"))
        .finally(() => setLoading(false));
    } else if (paymentMethod === "stripe") {
      navigate("/pay-with-card", { state: { orderPayload, totalCost } });
    } else if (paymentMethod === "esewa") {
      navigate("/pay-with-esewa", { state: { orderPayload, totalCost } });
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input className="input input-bordered w-full mb-4"
               value={email} onChange={e => setEmail(e.target.value)} required />

        <label>Address:</label>
        <input className="input input-bordered w-full mb-4"
               value={address} onChange={e => setAddress(e.target.value)} required />

        <label>Phone:</label>
        <input className="input input-bordered w-full mb-6"
               value={phone} onChange={e => setPhone(e.target.value)} required />

        <fieldset className="mb-4">
          <legend>Shipping Method</legend>
          {SHIPPING_OPTIONS.map(opt => (
            <label key={opt.id} className="block">
              <input type="radio" name="ship" checked={shippingMethod === opt.id}
                     onChange={() => setShippingMethod(opt.id)} />
              {opt.label} ({opt.cost === 0 ? "Free" : `$${opt.cost}`})
            </label>
          ))}
        </fieldset>

        <fieldset className="mb-4">
          <legend>Payment Method</legend>
          {PAYMENT_METHODS.map(opt => (
            <label key={opt.id} className="block">
              <input type="radio" name="pay" checked={paymentMethod === opt.id}
                     onChange={() => setPaymentMethod(opt.id)} />
              {opt.label}
            </label>
          ))}
        </fieldset>

        {/* Order Summary */}
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.id}>
            {item.book_detail.title} — {item.quantity} × ${item.book_detail.price}
          </div>
        ))}

        <div className="font-bold mb-4">Total: ${totalCost}</div>

        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Processing..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

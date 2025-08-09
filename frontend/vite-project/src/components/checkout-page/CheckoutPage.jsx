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
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{7,15}$/;

  useEffect(() => {
    if (!cartItems.length) {
      toast.error("No items selected for checkout.");
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const itemsSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.book_detail.price) * item.quantity,
    0
  );

  const shippingCost = SHIPPING_OPTIONS.find(opt => opt.id === shippingMethod)?.cost || 0;
  const totalCost = (itemsSubtotal + shippingCost).toFixed(2);

  const isAddressValid = address.trim().length > 5;
  const isPhoneValid = phoneRegex.test(phone);
  const isEmailValid = emailRegex.test(email);

  const canSubmit = isAddressValid && isPhoneValid && isEmailValid;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }
    setLoading(true);
    setError(null);

    const orderItems = cartItems.map((item) => ({
      book: item.book_detail.id,
      quantity: item.quantity,
      price: Number(item.book_detail.price).toFixed(2),
    }));

    const orderPayload = {
      address,
      phone,
      email,
      shipping_method: shippingMethod,
      payment_method: paymentMethod,
      shipping_cost: shippingCost,
      total: totalCost,
      items: orderItems,
    };

    try {
      // Create order
      const orderResp = await axios.post(`${API_BASE_URL}/orders/`, orderPayload, {
        headers: { Authorization: `Token ${authToken}` },
      });

      const orderId = orderResp.data.id;

      if (paymentMethod === "cash_on_delivery") {
        toast.success("Order placed successfully via Cash on Delivery!");
        navigate("/order-confirmation", { state: { order: orderResp.data } });
      } 
      else if (paymentMethod === "esewa") {
  // Get payment initiation data from backend
  const payResp = await axios.get(`${API_BASE_URL}/orders/${orderId}/initiate_esewa_payment/`, {
    headers: { Authorization: `Token ${authToken}` },
  });

 const { amt, txAmt, psc, pdc, tAmt, pid, scd, su, fu } = payResp.data;
const paymentUrl = `https://rc.esewa.com.np/epay/main?amt=${amt}&txAmt=${txAmt}&psc=${psc}&pdc=${pdc}&tAmt=${tAmt}&pid=${pid}&scd=${scd}&su=${su}&fu=${fu}`;
window.open(paymentUrl, "_blank"); // optionally open in new tab

  // OLD → window.location.href = paymentUrl;
  window.open(paymentUrl, "_blank"); // open in new tab
}

    } catch (err) {
      const message = err.response?.data?.detail || "Failed to place order. Try again.";
      setError(message);
      toast.error(message);
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmitOrder} noValidate>

        {/* Email */}
        <label className="block font-semibold mb-2">Email Address</label>
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`input input-bordered w-full mb-4 ${email.length > 0 && !isEmailValid ? "border-red-500" : ""}`}
        />
        {email.length > 0 && !isEmailValid && (
          <p className="text-red-500 text-sm mb-4">Please enter a valid email.</p>
        )}

        {/* Address */}
        <label className="block font-semibold mb-2">Shipping Address</label>
        <input
          type="text"
          placeholder="Enter shipping address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className={`input input-bordered w-full mb-4 ${address.length > 0 && !isAddressValid ? "border-red-500" : ""}`}
        />
        {address.length > 0 && !isAddressValid && (
          <p className="text-red-500 text-sm mb-4">Address is too short.</p>
        )}

        {/* Phone */}
        <label className="block font-semibold mb-2">Phone Number</label>
        <input
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className={`input input-bordered w-full mb-6 ${phone.length > 0 && !isPhoneValid ? "border-red-500" : ""}`}
        />
        {phone.length > 0 && !isPhoneValid && (
          <p className="text-red-500 text-sm mb-6">Please enter a valid phone number (7-15 digits).</p>
        )}

        {/* Shipping Method */}
        <fieldset className="mb-3">
          <legend className="text-lg font-semibold mb-2">Shipping Method</legend>
          <div className="space-y-2">
            {SHIPPING_OPTIONS.map(({ id, label, cost, eta }) => (
              <label key={id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="shipping"
                  value={id}
                  checked={shippingMethod === id}
                  onChange={() => setShippingMethod(id)}
                />
                <div>
                  <div className="font-semibold">{label}</div>
                  <div className="text-sm text-gray-600">
                    {eta} — {cost === 0 ? "Free" : `$${cost}`}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Payment Method */}
        <fieldset className="mb-6">
          <legend className="text-lg font-semibold mb-3">Payment Method</legend>
          <div className="space-y-2">
            {PAYMENT_METHODS.map(({ id, label }) => (
              <label key={id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value={id}
                  checked={paymentMethod === id}
                  onChange={() => setPaymentMethod(id)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Order Summary */}
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white border rounded shadow p-4 flex flex-col items-center text-center">
              <img
                src={
                  item.book_detail.cover_image?.startsWith("http")
                    ? item.book_detail.cover_image
                    : `http://localhost:8000${item.book_detail.cover_image}`
                }
                alt={item.book_detail.title}
                className="w-28 h-36 object-contain rounded mb-2"
              />
              <div className="font-semibold mt-2 mb-1">{item.book_detail.title}</div>
              <div className="text-sm text-gray-500 mb-1">{item.book_detail.author}</div>
              <div className="mb-1">
                <span className="font-semibold">${parseFloat(item.book_detail.price).toFixed(2)}</span>
                <span className="mx-2">x</span>
                <span>{item.quantity}</span>
              </div>
              <div className="font-bold text-indigo-600">
                Total: ${(parseFloat(item.book_detail.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Cost Summary */}
        <div className="flex flex-col items-end mb-6">
          <div className="text-sm">
            <span className="mr-8">Shipping:</span>
            <span className="font-semibold text-indigo-700">${shippingCost.toFixed(2)}</span>
          </div>
          <div className="text-sm">
            <span className="mr-9">Items:</span>
            <span className="font-semibold">${itemsSubtotal.toFixed(2)}</span>
          </div>
          <div className="text-lg font-bold mt-1">
            Total Cost: <span className="text-indigo-700">${totalCost}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          disabled={loading}
          type="submit"
          className={`btn btn-primary bg-amber-500 w-full flex items-center justify-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}

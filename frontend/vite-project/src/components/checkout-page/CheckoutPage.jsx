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
  { id: "CashonDelivery", label: "Cash on Delivery" },
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
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if no items
  useEffect(() => {
    if (!cartItems.length) {
      toast.error("No items selected for checkout.");
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  // Validation regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{7,15}$/; // simple numeric phone check

  // Calculate subtotal price of items
  const itemsSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.book_detail.price) * item.quantity,
    0
  );

  // Add cost of shipping method
  const shippingCost = SHIPPING_OPTIONS.find((opt) => opt.id === shippingMethod)?.cost || 0;

  // Grand total
  const totalPrice = (itemsSubtotal + shippingCost).toFixed(2);

  // Real-time validation flags
  const isAddressValid = address.trim().length > 5;
  const isPhoneValid = phoneRegex.test(phone);
  const isEmailValid = emailRegex.test(email);

  const canSubmit = isAddressValid && isPhoneValid && isEmailValid;
const totalCost = (itemsSubtotal + shippingCost).toFixed(2);
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
      total: totalPrice,
      items: orderItems,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/orders/`, orderPayload, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Order placed successfully!");
      navigate("/order-success", { state: { order: response.data } });
      console.log(response.data)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          "Failed to place order. Please try again."
      );
      toast.error(error || "Failed to place order.");
    } finally {
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
        <label className="block font-semibold mb-2" htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`input input-bordered w-full mb-4 ${
            email.length > 0 && !isEmailValid ? "border-red-500" : ""
          }`}
        />
        {email.length > 0 && !isEmailValid && (
          <p className="text-red-500 text-sm mb-4">Please enter a valid email.</p>
        )}

        {/* Shipping Address */}
        <label className="block font-semibold mb-2" htmlFor="address">
          Shipping Address
        </label>
        <input
          id="address"
          type="text"
          placeholder="Enter shipping address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className={`input input-bordered w-full mb-4 ${
            address.length > 0 && !isAddressValid ? "border-red-500" : ""
          }`}
        />
        {address.length > 0 && !isAddressValid && (
          <p className="text-red-500 text-sm mb-4">Address is too short.</p>
        )}

        {/* Phone Number */}
        <label className="block font-semibold mb-2" htmlFor="phone">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className={`input input-bordered w-full mb-6 ${
            phone.length > 0 && !isPhoneValid ? "border-red-500" : ""
          }`}
        />
        {phone.length > 0 && !isPhoneValid && (
          <p className="text-red-500 text-sm mb-6">
            Please enter a valid phone number (10 digits).
          </p>
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
                className="cursor-pointer"
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
                  className="cursor-pointer"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

        </fieldset>

        {/* Book grid summary */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-3xl">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border rounded shadow p-4 flex flex-col items-center text-center"
              >
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
        </div>

        {/* Dynamic Cost Summary */}
      <div className="flex flex-col items-end mb-6 mt-2">
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

        <button
          disabled={loading}
          type="submit"
          className={`btn btn-primary bg-amber-500 cursor-pointer w-full flex items-center justify-center gap-2 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Processing...
            </>
          ) : (
            "Place Order"
          )}
        </button>
      </form>
    </div>
  );
}

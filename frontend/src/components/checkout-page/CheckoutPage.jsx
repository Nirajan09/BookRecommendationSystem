import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FaCreditCard, FaMoneyBillWave, FaWallet } from "react-icons/fa";

const API_BASE_URL = "http://localhost:8000";

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard Delivery", cost: 50, eta: "3-5 business days" },
  { id: "express", label: "Express Delivery", cost: 150, eta: "1-2 business days" },
  { id: "pickup", label: "Store Pickup", cost: 0, eta: "Ready within 24 hrs" },
];

const PAYMENT_METHODS = [
  { id: "stripe", label: "Credit/Debit Card (Stripe)", icon: <FaCreditCard /> },
  { id: "esewa", label: "E-Sewa", icon: <FaWallet /> },
  { id: "cash_on_delivery", label: "Cash on Delivery", icon: <FaMoneyBillWave /> },
];

const PROVINCES = [
  "Province 1", "Province 2", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"
];

const CITIES_BY_PROVINCE = {
  "Province 1": ["Biratnagar", "Dharan", "Birgunj"],
  "Province 2": ["Janakpur", "Birgunj", "Bardibas"],
  "Bagmati": ["Kathmandu", "Lalitpur", "Bhaktapur"],
  "Gandaki": ["Pokhara", "Baglung", "Gorkha"],
  "Lumbini": ["Butwal", "Tansen", "Bhairahawa"],
  "Karnali": ["Surkhet", "Jumla", "Dolpa"],
  "Sudurpashchim": ["Dhangadhi", "Mahendranagar", "Dadeldhura"]
};

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token: authToken } = useAuth();
  const cartItems = location.state?.items || [];
  console.log(cartItems)
  const [province, setProvince] = useState(PROVINCES[0]);
  const [city, setCity] = useState(CITIES_BY_PROVINCE[PROVINCES[0]][0]);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      street: "",
      ward: "",
      postalCode: "",
    }
  });

  const itemsSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.book_detail.price) * item.quantity,
    0
  );
  const shippingCost = SHIPPING_OPTIONS.find(opt => opt.id === shippingMethod)?.cost || 0;
  const tax = (itemsSubtotal * 0.13).toFixed(2);
  const totalCost = (itemsSubtotal + shippingCost + parseFloat(tax)).toFixed(2);

  useEffect(() => {
    if (!cartItems.length) {
      toast.error("No items for checkout.");
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const handleProvinceChange = (prov) => {
    setProvince(prov);
    setCity(CITIES_BY_PROVINCE[prov][0]);
  };

  const onSubmit = (data) => {
    const orderPayload = {
      full_name: data.fullName,
      street: data.street,
      ward: data.ward,
      province: province,
      city: city,
      postal_code: data.postalCode,
      phone: data.phone,
      email: data.email,
      shipping_method: shippingMethod,
      payment_method: paymentMethod,
      shipping_cost: shippingCost.toFixed(2),
      total: totalCost,
      items: cartItems.map(item => ({
        book: item.book_detail.id,
        quantity: item.quantity,
        price: Number(item.book_detail.price).toFixed(2),
      })),
    };

    setLoading(true);

    if (paymentMethod === "cash_on_delivery") {
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
    <div className="max-w-5xl mx-auto mt-10 grid md:grid-cols-2 gap-8 ">
      {/* Left Column - Form */}
      <div className="bg-white/90 rounded-3xl shadow-xl p-8 border-2 border-blue-200 flex flex-col">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
          Shipping Information
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-grow flex flex-col">

          {/* Row 1: Full Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                {...register("fullName", { required: "Full Name is required" })}
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
          </div>

          {/* Row 2: Phone + Street Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                {...register("phone", { required: "Phone number is required" })}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Street Address</label>
              <input
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                {...register("street", { required: "Street is required" })}
              />
              {errors.street && <p className="text-red-500 text-sm">{errors.street.message}</p>}
            </div>
          </div>

          {/* Row 3: Ward / Area + Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Ward / Area</label>
              <input
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                {...register("ward")}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Postal Code</label>
              <input
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                {...register("postalCode")}
              />
              {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode.message}</p>}
            </div>
          </div>

          {/* Province & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Province</label>
              <select
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={province}
                onChange={e => handleProvinceChange(e.target.value)}
              >
                {PROVINCES.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">City</label>
              <select
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={city}
                onChange={e => setCity(e.target.value)}
              >
                {(CITIES_BY_PROVINCE[province] || []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
              Shipping Method
            </h2>
            {SHIPPING_OPTIONS.map(opt => (
              <label key={opt.id} className="flex items-center mb-2 cursor-pointer">
                <input
                  type="radio"
                  name="ship"
                  checked={shippingMethod === opt.id}
                  onChange={() => setShippingMethod(opt.id)}
                  className="mr-2"
                />
                <span className="font-medium">{opt.label}</span> -
                <span>{opt.cost === 0 ? " Free" : ` Rs. ${opt.cost}`}</span>
                <span className="text-gray-500 ml-1">({opt.eta})</span>
              </label>
            ))}
          </div>
        </form>
      </div>

      {/* Right Column - Payment + Order Summary */}
      <div className="bg-white/90 rounded-3xl shadow-xl p-8 border-2 border-blue-200 flex flex-col">

        {/* Payment Method at the top */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
            Payment Method
          </h2>
          {PAYMENT_METHODS.map(opt => (
            <label key={opt.id} className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === opt.id}
                onChange={() => setPaymentMethod(opt.id)}
              />
              {opt.icon} {opt.label}
            </label>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 flex-grow flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
            Order Summary
          </h2>

          {/* Scrollable container for items */}
          <div className="space-y-4 h-60 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center">
                <img
                  src={item.book_detail.cover_image
                    ? `${item.book_detail.cover_image}`
                    : item.book_detail.dataset_image_url || "https://via.placeholder.com/150x220?text=No+Cover"}
                  alt={item.book_detail.title}
                  className="w-16 h-20 object-cover rounded shadow mr-3"
                />
                <div>
                  <p className="font-medium">{item.book_detail.title}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × Rs. {item.book_detail.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t pt-3 space-y-1 text-gray-700 mt-4">
            <div className="flex justify-between font-medium">
              Subtotal: <span>Rs. {itemsSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              Shipping: <span>Rs. {shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              Tax: <span>Rs. {tax}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900">
              Grand Total: <span>Rs. {totalCost}</span>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit(onSubmit)}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
            disabled={loading}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

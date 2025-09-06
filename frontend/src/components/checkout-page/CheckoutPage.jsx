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

  const [province, setProvince] = useState(PROVINCES[0]);
  const [city, setCity] = useState(CITIES_BY_PROVINCE[PROVINCES[0]][0]);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
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
    const address = `${data.street}, ${data.ward}, ${city}, ${province}${data.postalCode ? ", " + data.postalCode : ""}`;

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
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Full Name */}
        <label>Full Name:</label>
        <input
          className={`input input-bordered w-full mb-2 ${errors.fullName ? 'border-red-500' : ''}`}
          {...register("fullName", { required: "Full Name is required", minLength: { value: 2, message: "Minimum 2 characters" } })}
        />
        {errors.fullName && <p className="text-red-500 mb-2">{errors.fullName.message}</p>}

        {/* Email */}
        <label>Email:</label>
        <input
          className={`input input-bordered w-full mb-2 ${errors.email ? 'border-red-500' : ''}`}
          {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })}
        />
        {errors.email && <p className="text-red-500 mb-2">{errors.email.message}</p>}

        {/* Phone */}
        <label>Phone (Nepal mobile number)</label>
        <input
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^(98|97)\d{8}$/,
              message: "Phone must start with 97 or 98 and have 10 digits"
            }
          })}
        />
        {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
        {errors.phone && <p className="text-red-500 mb-2">{errors.phone.message}</p>}

        {/* Street */}
        <label>Street Address:</label>
        <input
          className={`input input-bordered w-full mb-2 ${errors.street ? 'border-red-500' : ''}`}
          {...register("street", { required: "Street is required", minLength: { value: 5, message: "Minimum 5 characters" } })}
        />
        {errors.street && <p className="text-red-500 mb-2">{errors.street.message}</p>}

        {/* Ward */}
        <label>Ward / Area / Locality:</label>
        <input
          className="input input-bordered w-full mb-2"
          {...register("ward")}
        />

        {/* Province & City */}
        <label>Province / State:</label>
        <select
          className="input input-bordered w-full mb-2"
          value={province}
          onChange={e => handleProvinceChange(e.target.value)}
        >
          {PROVINCES.map(prov => <option key={prov}>{prov}</option>)}
        </select>

        <label>City:</label>
        <select
          className="input input-bordered w-full mb-2"
          value={city}
          onChange={e => setCity(e.target.value)}
        >
          {CITIES_BY_PROVINCE[province].map(c => <option key={c}>{c}</option>)}
        </select>

        {/* Postal */}
        <label>Postal / ZIP Code:</label>
        <input
          className="input input-bordered w-full mb-4"
          {...register("postalCode", { pattern: { value: /^[0-9]{3,5}$/, message: "Invalid postal code" } })}
        />
        {errors.postalCode && <p className="text-red-500 mb-2">{errors.postalCode.message}</p>}

        {/* Shipping Method */}
        <fieldset className="mb-4">
          <legend>Shipping Method</legend>
          {SHIPPING_OPTIONS.map(opt => (
            <label key={opt.id} className="block mb-1">
              <input
                type="radio"
                name="ship"
                checked={shippingMethod === opt.id}
                onChange={() => setShippingMethod(opt.id)}
                className="mr-2"
              />
              <span className="font-medium">{opt.label}</span> -
              <span>{opt.cost === 0 ? " Free" : ` Rs. ${opt.cost}`}</span>
              <span className="text-gray-500"> - {opt.eta}</span>
            </label>
          ))}
        </fieldset>

        {/* Payment Method */}
        <fieldset className="mb-4">
          <legend>Payment Method</legend>
          {PAYMENT_METHODS.map(opt => (
            <label key={opt.id} className="flex items-center gap-2 mb-1">
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === opt.id}
                onChange={() => setPaymentMethod(opt.id)}
              />
              {opt.icon} {opt.label}
            </label>
          ))}
        </fieldset>

        {/* Order Summary */}
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center mb-2">
            <img src={item.book_detail.cover_image} alt={item.book_detail.title} className="w-40 h-40 mr-2" />
            <div>
              <div>{item.book_detail.title}</div>
              <div>{item.quantity} × Rs. {item.book_detail.price}</div>
            </div>
          </div>
        ))}

        <div className="border-t my-2"></div>
        <div className="flex justify-between mb-1">Subtotal: <span>Rs. {itemsSubtotal.toFixed(2)}</span></div>
        <div className="flex justify-between mb-1">Shipping Fee: <span>Rs. {shippingCost.toFixed(2)}</span></div>
        <div className="flex justify-between mb-1">Tax: <span>Rs. {tax}</span></div>
        <div className="flex justify-between font-bold mb-4">Grand Total: <span>Rs. {totalCost}</span></div>

        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Processing..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

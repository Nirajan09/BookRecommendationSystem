import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID not provided");
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE_URL}/orders/${orderId}/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      })
      .then((response) => {
        setOrder(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load order data");
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!order) return null;

  const fullAddress = `${order.street}${order.ward ? ", " + order.ward : ""}, ${order.city}, ${order.province}${
    order.postal_code ? ", " + order.postal_code : ""
  }`;

  const paymentMethodNames = {
    cash_on_delivery: "Cash On Delivery",
    stripe: "Credit/Debit Card (Stripe)",
    esewa: "E-Sewa",
  };
  console.log("Order",order)
  return (
    <div
      className="max-w-4xl mx-auto p-8 bg-white rounded-3xl shadow-xl mt-12"
      style={{ minHeight: "calc(100vh - 14vh)", paddingTop: "2rem", paddingBottom: "2rem", overflowY: "auto" }}
    >
      {/* Success Message */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-2 text-gray-900">Order Confirmed!</h1>
        <p className="text-gray-700 text-lg max-w-xl mx-auto">
          Thank you for your order. We've received it and will start processing right away.
        </p>
      </div>

      {/* Order Details */}
      <section className="bg-gray-50 rounded-2xl p-6 mb-10 shadow-inner border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Order Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-gray-700 text-base">
          <div>
            <p className="font-semibold uppercase tracking-wide">Order Number</p>
            <p className="mt-1">{order.reference || order.id}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide">Order Date</p>
            <p className="mt-1">{new Date(order.created).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide">Total Amount</p>
            <p className="mt-1 font-bold">Rs. {Number(order.total).toFixed(2)}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide">Payment Method</p>
            <p className="mt-1">{paymentMethodNames[order.payment_method] || order.payment_method}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide">Order Status</p>
            <p className="mt-1 capitalize">{order.status}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide">Payment Status</p>
            <p className="mt-1 capitalize">{order.payment_status}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide">Shipping Method</p>
            <p className="mt-1 capitalize">{order.shipping_method}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide">Shipping Cost</p>
            <p className="mt-1">Rs. {Number(order.shipping_cost).toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* Combined Items and Delivery Information Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">

      {/* Items */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Items</h2>
        <div className="space-y-6 max-h-[50vh] overflow-auto pr-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-5">
                <img
                  src={
                    item.cover_image
                      ? `${item.cover_image}`
                      : item.dataset_image_url || "https://via.placeholder.com/150x220?text=No+Cover"
                  }
                  alt={item.book_title || "Book Cover"}
                  className="w-20 h-24 rounded-lg shadow object-cover"
                />
                <div>
                  <p className="font-semibold text-lg text-gray-700">{item.book_title}</p>
                  <p className="text-gray-500 mt-1">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-bold text-indigo-700 text-lg">Rs. {Number(item.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery Info */}
      <section className="bg-gray-50 rounded-2xl p-6 shadow-inner border border-gray-200 h-fit">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-3">Delivery Information</h2>
        <p className="text-gray-700 text-lg">{fullAddress}</p>
        <p className="mt-2 text-gray-600">
          Expected Delivery: <span className="font-semibold">3-5 business days</span>
        </p>
      </section>

    </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-6 justify-center mt-12">
        <button
          onClick={() => window.print()}
          className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 shadow-lg transition"
        >
          Print Receipt
        </button>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-200 text-gray-800 px-8 py-3 rounded-xl hover:bg-gray-300 shadow-lg transition"
        >
          Continue Shopping
        </button>
      </div>

      {/* Email Confirmation */}
      {/* <p className="text-center text-gray-500 text-sm mt-10 max-w-md mx-auto">
        A confirmation email has been sent to{" "}
        <span className="font-semibold">{order.email}</span>. We'll notify you when your order is shipped.
      </p> */}
    </div>
  );
}

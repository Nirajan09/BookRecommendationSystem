import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export default function OrderConfirmation() {
    const { orderId } = useParams(); // gets ID from URL

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
                console.log(response.data)
            })
            .catch((err) => {
                setError(err.response?.data?.detail || "Failed to load order data");
                setLoading(false);
            });
    }, [orderId]);

    if (loading) {
        return <div className="p-6 text-center">Loading order details...</div>;
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
                >
                    Go Home
                </button>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Success Message */}
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                <p className="text-gray-600">
                    Thank you for your order. We've received it and will start processing
                    right away.
                </p>
            </div>

            {/* Order Summary */}
            <div className="bg-white shadow-md rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700 text-sm">
                    <div>
                        <p className="font-medium">Order Number</p>
                        <p>{order.id}</p>
                    </div>
                    <div>
                        <p className="font-medium">Order Date</p>
                        <p>{new Date(order.updated).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="font-medium">Total Amount</p>
                        <p>${Number(order.total).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="font-medium">Payment Method</p>
                        <p>{order.payment_method === "cash_on_delivery"
                            ? "Cash On Delivery"
                            : order.payment_method === "stripe"
                                ? "Credit/Debit Card (Stripe)"
                                : order.payment_method === "esewa"
                                    ? "E-Sewa"
                                    : order.payment_method}</p>
                    </div>
                </div>

                {/* Items */}
                <div className="mt-6">
                    {order.items.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between border-b py-3"
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    src={
                                        item.book_cover?.startsWith("http")
                                            ? item.book_cover
                                            : `http://localhost:8000${item.book_cover}`
                                    }
                                    alt={item.title}
                                    className="w-16 h-16 object-cover rounded"
                                />
                                <div>
                                    <p className="font-medium">{item.title}</p>
                                    <p className="text-sm text-gray-500">
                                        Qty: {item.quantity}
                                    </p>
                                </div>
                            </div>
                            <p className="font-semibold">${Number(item.price).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white shadow-md rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                <p className="text-gray-700">{order.address}</p>
                <div className="mt-2 text-gray-600">
                    Expected Delivery:{" "}
                    <span className="ml-1 font-medium">
                        {order.delivery_date || "3-5 business days"}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 justify-center mt-8">
                <button
                    onClick={() => window.print()}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                >
                    Print Receipt
                </button>
                <button
                    onClick={() => navigate("/")}
                    className="bg-gray-100 px-5 py-2 rounded-lg hover:bg-gray-200"
                >
                    Continue Shopping
                </button>
            </div>

            {/* Email Confirmation */}
            <p className="text-center text-gray-500 text-sm mt-6">
                A confirmation email has been sent to{" "}
                <span className="font-medium">{order.email}</span>. We'll notify you
                when your order is shipped.
            </p>
        </div>
    );
}

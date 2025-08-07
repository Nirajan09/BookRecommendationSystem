import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function UserDashboard() {
  // Section refs for scrolling (optional, used in your original code)
  const overviewRef = useRef(null);
  const ordersRef = useRef(null);
  const settingsRef = useRef(null);
  const reviewsRef = useRef(null);
  const returnsRef = useRef(null);

  // Dummy reviews and settings (as before)
  const reviews = [
    {
      user: "Olivia Bennett",
      date: "July 20, 2023",
      rating: 5,
      text: "The product exceeded my expectations. The quality is excellent, and it arrived on time. I highly recommend it!",
      likes: 15,
      comments: 2,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      user: "Chloe Carter",
      date: "June 10, 2023",
      rating: 4,
      text: "I'm satisfied with my purchase. The product is good, but there's room for improvement in the packaging.",
      likes: 8,
      comments: 1,
      avatar: "https://randomuser.me/api/portraits/women/47.jpg",
    },
  ];
  const settings = [
    "Change Password",
    "Update Email Address",
    "Manage Payment Methods",
    "Manage Shipping Addresses",
  ];

  // Navigation handler (optional, if using anchors)
  const handleNav = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { token } = useAuth();

  // Fetch user profile
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get("http://localhost:8000/userprofile/profile/", {
          headers: { Authorization: `Token ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("User profile fetch error:", err);
      }
    }
    if (token) {
      fetchUser();
    }
  }, [token]);

  // Fetch orders with nested items
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await axios.get("http://localhost:8000/orders/", {
          headers: { Authorization: `Token ${token}` },
        });
        setOrders(res.data); // Make sure each order includes nested items array
      } catch (error) {
        toast.error("Failed to load order history.");
        console.error(error);
      }
    }
    if (token) {
      fetchOrders();
    }
  }, [token]);

  if (!user) return <div>Loading user profile...</div>;

  const joined = new Date(user.date_joined).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row max-w-5xl mx-auto py-8">
        {/* Main Content */}
        <main className="flex-1 px-4 md:px-8">
          {/* Overview */}
          <section ref={overviewRef} className="mb-12" id="overview">
            <h1 className="text-3xl font-bold mb-4">My Account</h1>
            <div className="flex items-center mb-6">
              <img
                src={
                  user.image?.startsWith("http")
                    ? user.image
                    : `http://localhost:8000${user.profile.avatar}`
                }
                alt={user.name || "User"}
                className="w-20 h-20 rounded-full mr-4"
              />
              <div>
                <div className="font-semibold text-xl">
                  {user.first_name + " " + user.last_name}
                </div>
                <div className="text-blue-500">Member since {joined}</div>
              </div>
            </div>
          </section>

          {/* Order History */}
          <section ref={ordersRef} className="mb-12" id="orders">
            <h2 className="text-xl font-bold mb-4">Order History</h2>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 text-left text-gray-600">
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-500">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">#{order.id}</td>
                        <td className="py-3 px-4 text-blue-500">
                          {new Date(order.created).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status.toLowerCase() === "shipped"
                                ? "bg-blue-100 text-blue-700"
                                : order.status.toLowerCase() === "delivered"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">${Number(order.total).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-indigo-600 hover:underline focus:outline-none"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Account Settings */}
          <section ref={settingsRef} className="mb-12" id="settings">
            <h2 className="text-xl font-bold mb-2">Account Settings</h2>
            <ul>
              {settings.map((setting) => (
                <li
                  key={setting}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <span>{setting}</span>
                  <span className="text-gray-400">&rarr;</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Reviews */}
          <section ref={reviewsRef} className="mb-12" id="reviews">
            <h2 className="text-xl font-bold mb-2">Reviews</h2>
            {reviews.map((review, idx) => (
              <div key={idx} className="mb-6">
                <div className="flex items-center mb-1">
                  <img
                    src={review.avatar}
                    alt={review.user}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <div className="font-semibold">{review.user}</div>
                    <div className="text-xs text-gray-500">{review.date}</div>
                  </div>
                </div>
                <div className="flex items-center mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < review.rating ? "text-blue-500" : "text-gray-300"}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="mb-2">{review.text}</div>
                <div className="flex space-x-4 text-gray-500 text-sm">
                  <span>👍 {review.likes}</span>
                  <span>💬 {review.comments}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Returns/Exchanges */}
          <section ref={returnsRef} className="mb-12" id="returns">
            <h2 className="text-xl font-bold mb-2">Returns/Exchanges</h2>
            <p>
              To initiate a return or exchange, please visit our Returns Center or contact customer support.
            </p>
          </section>
        </main>
      </div>

      {/* Modal for Order Details */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4"
          onClick={() => setSelectedOrder(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Order #{selectedOrder.id} Details
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                aria-label="Close modal"
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                &#10005;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {selectedOrder.items.map((item) => (

                <div
                  key={item.id}
                  className="border rounded p-4 flex flex-col items-center text-center"
                >
                  <img
                    src={
                      item.book_cover?.startsWith("http")
                        ? item.book_cover
                        : `http://localhost:8000${item.book_cover}`
                    }
                    alt={item.book_title}
                    className="w-28 h-36 object-contain rounded mb-2"
                  />
                  <div className="font-semibold">{item.book_title}</div>
                  <div className="text-sm mb-1">Quantity: {item.quantity}</div>
                  <div className="font-bold text-indigo-600">
                    Total: ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

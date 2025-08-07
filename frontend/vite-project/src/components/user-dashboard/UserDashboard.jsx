import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";

export default function UserDashboard() {
  // Section refs for scrolling
  const overviewRef = useRef(null);
  const ordersRef = useRef(null);
  const settingsRef = useRef(null);
  const reviewsRef = useRef(null);
  const returnsRef = useRef(null);

  // Dummy data (replace with API calls for backend integration)
  const orders = [
    { id: "#123456", date: "July 15, 2023", status: "Shipped", total: "$120.00" },
    { id: "#654321", date: "June 20, 2023", status: "Delivered", total: "$85.00" },
    { id: "#987654", date: "May 5, 2023", status: "Delivered", total: "$50.00" },
  ];
  const reviews = [
    {
      user: "Olivia Bennett",
      date: "July 20, 2023",
      rating: 5,
      text: "The product exceeded my expectations. The quality is excellent, and it arrived on time. I highly recommend it!",
      likes: 15,
      comments: 2,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      user: "Chloe Carter",
      date: "June 10, 2023",
      rating: 4,
      text: "I'm satisfied with my purchase. The product is good, but there's room for improvement in the packaging.",
      likes: 8,
      comments: 1,
      avatar: "https://randomuser.me/api/portraits/women/47.jpg"
    }
  ];
  const settings = [
    "Change Password",
    "Update Email Address",
    "Manage Payment Methods",
    "Manage Shipping Addresses"
  ];

  // Navigation handler
  const handleNav = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  const [user, setUser] = useState(null);
  const { token } = useAuth();

 useEffect(() => {
  async function fetchUser() {
    try {
      const res = await axios.get("http://localhost:8000/userprofile/profile/", {
        headers: { Authorization: `Token ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error("User profile fetch error:", err); // <-- Add this!
    }
  }
  fetchUser();
}, [token]);


  if (!user) return <div>Loading...</div>;

  // Parse date
  const joined = new Date(user.date_joined).toLocaleDateString("en-US", {
     day: "numeric",
    month: "long",
    year: "numeric"
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
                <div className="font-semibold text-xl">{user.first_name + " "+ user.last_name}</div>
                <div className="text-blue-500">Member since {joined}</div>
              </div>
            </div>
          </section>

          {/* Order History */}
          <section ref={ordersRef} className="mb-12" id="orders">
            <h2 className="text-xl font-bold mb-2">Order History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg border">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 px-4">Order</th>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="py-2 px-4">{order.id}</td>
                      <td className="py-2 px-4 text-blue-500">{order.date}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "Shipped"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Account Settings */}
          <section ref={settingsRef} className="mb-12" id="settings">
            <h2 className="text-xl font-bold mb-2">Account Settings</h2>
            <ul>
              {settings.map((setting, idx) => (
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
    </div>
  );
}

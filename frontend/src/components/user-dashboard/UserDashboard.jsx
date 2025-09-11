import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function UserDashboard() {
  const reviewMenuRef = useRef(null);
  const [reviewMenuOpenId, setReviewMenuOpenId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(0);

  const settings = [
    "Change Password",
    "Update Email Address",
    "Manage Payment Methods",
    "Manage Shipping Addresses",
  ];

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const { token } = useAuth();

  const [reviews, setReviews] = useState([]);

  const fetchUserReviews = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:8000/books/user-reviews/", {
        headers: { Authorization: `Token ${token}` },
      });
      setReviews(Array.isArray(res.data?.results) ? res.data.results : []);
    } catch {
      toast.error("Failed to load your reviews");
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchUserReviews();
  }, [token]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get("http://localhost:8000/userprofile/profile/", {
          headers: { Authorization: `Token ${token}` },
        });
        setUser(res.data);
      } catch {
        // ignore errors for now
      }
    }
    if (token) fetchUser();
  }, [token]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await axios.get("http://localhost:8000/orders/", {
          headers: { Authorization: `Token ${token}` },
        });
        setOrders(Array.isArray(res.data?.results) ? res.data.results : []);
      } catch {
        toast.error("Failed to load order history.");
        setOrders([]);
      }
    }
    if (token) fetchOrders();
  }, [token]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (reviewMenuRef.current && !reviewMenuRef.current.contains(event.target)) {
        setReviewMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user)
    return (
      <div className="bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60 min-h-screen flex items-center justify-center text-gray-500">
        Loading user profile...
      </div>
    );

  const joined = new Date(user.date_joined).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60 min-h-screen p-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10">
        <main className="flex-1 bg-white/90 p-8 rounded-2xl shadow-xl border border-blue-200">
          {/* Overview */}
          <section className="mb-12" id="overview">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">My Account</h1>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={
                  user.image?.startsWith("http")
                    ? user.image
                    : user.profile?.avatar
                    ? `http://localhost:8000${user.profile.avatar}`
                    : "/DefaultAvatar.png"
                }
                alt={user.name || "User"}
                className="w-20 h-20 rounded-full border border-gray-200 shadow-sm"
              />
              <div>
                <div className="font-semibold text-xl text-gray-800">{user.first_name} {user.last_name}</div>
                <div className="text-blue-600">Member since {joined}</div>
              </div>
            </div>
          </section>

          {/* Order History */}
          <section className="mb-12" id="orders">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Order History</h2>
            <div className="overflow-x-auto rounded-lg shadow bg-white">
              <table className="min-w-full">
                <thead className="bg-blue-100 text-blue-700 text-left">
                  <tr>
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
                    orders.map(order => (
                      <tr key={order.id} className="border-t hover:bg-blue-50">
                        <td className="py-3 px-4">#{order.reference}</td>
                        <td className="py-3 px-4 text-blue-600">
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
                        <td className="py-3 px-4">Rs. {Number(order.total).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <button
                            className="text-indigo-600 hover:underline focus:outline-none"
                            onClick={() => setSelectedOrder(order)}
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
          <section className="mb-12" id="settings">
            <h2 className="text-xl font-bold mb-2 text-blue-700">Account Settings</h2>
            <ul>
              {settings.map((setting) => (
                <li
                  key={setting}
                  className="flex justify-between items-center py-2 border-b last:border-b-0 text-gray-600 font-medium"
                >
                  {setting}
                  <span className="text-blue-300">&rarr;</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Reviews */}
          <section className="mb-12" id="reviews">
            <h2 className="text-xl font-bold mb-2 text-blue-700">My Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400">There are no reviews yet.</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="mb-6 border rounded-2xl p-4 bg-white shadow-sm">
                  <div className="flex items-center mb-2">
                    <img
                      src={
                        review.book.cover_image?.startsWith("http")
                          ? review.book.cover_image
                          : `http://localhost:8000${review.book.cover_image}`
                      }
                      alt={review.book.title}
                      className="w-12 h-16 object-contain rounded border border-gray-200 mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">{review.book.title}</div>
                      <div className="text-gray-600">{review.book.author}</div>
                      <div className="text-xs text-gray-400">
                        {review.rated_at
                          ? new Date(review.rated_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </div>
                    </div>
                    <div style={{ position: "relative", marginLeft: "auto" }}>
                      <button
                        className="text-gray-500 hover:text-gray-900 p-2 rounded-full"
                        onClick={() => setReviewMenuOpenId(review.id)}
                        aria-label="More options"
                      >
                        <BsThreeDotsVertical size={20} />
                      </button>
                      {reviewMenuOpenId === review.id && (
                        <div
                          ref={reviewMenuRef}
                          className="absolute right-0 mt-2 w-36 bg-white shadow-xl border border-blue-200 rounded z-10"
                        >
                          <button
                            className="block w-full px-4 py-2 text-left hover:bg-blue-50"
                            onClick={() => {
                              setSelectedReview(review);
                              setEditRating(review.rating);
                              setEditComment(review.comment || "");
                              setShowEditModal(true);
                              setReviewMenuOpenId(null);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="block w-full px-4 py-2 text-left hover:bg-red-50 text-red-600"
                            onClick={() => {
                              setSelectedReview(review);
                              setShowDeleteModal(true);
                              setReviewMenuOpenId(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map(star =>
                      star <= review.rating ? (
                        <AiFillStar key={star} size={22} className="text-yellow-400" />
                      ) : (
                        <AiOutlineStar key={star} size={22} className="text-yellow-400" />
                      )
                    )}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

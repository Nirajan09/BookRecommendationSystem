import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import Loader from "../../shared/Loader";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-orange-100 text-orange-800",
  shipped: "bg-blue-100 text-blue-600",
  delivered: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-600",
};

export default function UserDashboard() {
  const reviewMenuRef = useRef(null);
  const [reviewMenuOpenId, setReviewMenuOpenId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);

  // Fetch user reviews
  const fetchUserReviews = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${backendUrl}/books/user-reviews/`, {
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

  // Fetch user profile
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get(`${backendUrl}/userprofile/profile/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setUser(res.data);
      } catch {
        // ignore errors
      }
    }
    if (token) fetchUser();
  }, [token]);

  // Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await axios.get(`${backendUrl}/orders/`, {
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

  // Close review menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (reviewMenuRef.current && !reviewMenuRef.current.contains(event.target)) {
        setReviewMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return <Loader />;

  const joined = new Date(user.date_joined).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Cancel order API call
  const cancelOrder = async (orderId) => {
    try {
      await axios.post(`${backendUrl}/orders/${orderId}/cancel/`, {}, {
        headers: { Authorization: `Token ${token}` },
      });
      toast.success("Order cancelled successfully.");
      const res = await axios.get(`${backendUrl}/orders/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setOrders(Array.isArray(res.data?.results) ? res.data.results : []);
      setSelectedOrder(null);
    } catch {
      toast.error("Failed to cancel order.");
    }
  };

  return (
    <div className="bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60 p-8">
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
                      ? `${backendUrl}${user.profile.avatar}`
                      : "/DefaultAvatar.png"
                }
                alt={user.name || "User"}
                className="w-20 h-20 rounded-full border border-gray-200 shadow-sm"
              />
              <div>
                <div className="font-semibold text-xl text-gray-800">
                  {user.first_name} {user.last_name}
                </div>
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
                    orders.map((order) => (
                      <tr key={order.id} className="border-t border-t-blue-200 hover:bg-blue-50">
                        <td className="py-3 px-4">#{order.reference}</td>
                        <td className="py-3 px-4 text-blue-600">
                          {new Date(order.created).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[order.status.toLowerCase()] || "bg-gray-100 text-gray-600"
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

          {/* Reviews */}
          <section className="mb-12" id="reviews">
            <h2 className="text-xl font-bold mb-2 text-blue-700">My Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400">There are no reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="mb-6 rounded-2xl p-4 bg-white shadow-sm border border-blue-200">
                  <div className="flex items-center mb-2">
                    <img
                      src={
                        review.book.source === "dataset"
                          ? review.book.dataset_image_url
                          : review.book.cover_image
                            ? review.book.cover_image.startsWith("http")
                              ? review.book.cover_image
                              : `${backendUrl}${review.book.cover_image}`
                            : "/DefaultBookCover.png"
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
                    {[1, 2, 3, 4, 5].map((star) =>
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

      {/* Edit & Delete Review Modals */}
      {showEditModal && selectedReview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white p-6 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Edit Review</h2>
            <div className="flex mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setEditRating(star)}>
                  {star <= editRating ? (
                    <AiFillStar size={24} className="text-yellow-400" />
                  ) : (
                    <AiOutlineStar size={24} className="text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded"
                onClick={async () => {
                  try {
                    await axios.put(
                      `${backendUrl}/books/reviews/${selectedReview.id}/`,
                      { rating: editRating, comment: editComment },
                      { headers: { Authorization: `Token ${token}` } }
                    );
                    toast.success("Review updated");
                    setShowEditModal(false);
                    fetchUserReviews();
                  } catch {
                    toast.error("Failed to update review");
                  }
                }}
              >
                Save
              </button>
              <button className="flex-1 bg-gray-300 py-2 rounded" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedReview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white p-6 rounded-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Delete Review</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this review?</p>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-red-600 text-white py-2 rounded"
                onClick={async () => {
                  try {
                    await axios.delete(
                      `${backendUrl}/books/reviews/${selectedReview.id}/`,
                      { headers: { Authorization: `Token ${token}` } }
                    );
                    toast.success("Review deleted");
                    setShowDeleteModal(false);
                    fetchUserReviews();
                  } catch {
                    toast.error("Failed to delete review");
                  }
                }}
              >
                Delete
              </button>
              <button className="flex-1 bg-gray-300 py-2 rounded" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onCancel={cancelOrder} />
      )}
    </div>
  );
}

function OrderDetailsModal({ order, onClose, onCancel }) {
  const items = order.items || [];
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-xl max-w-lg w-full shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Order #{order.reference}</h2>
        <p className="mb-2">
          <strong>Status:</strong>{" "}
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </p>
        <p className="mb-4">
          <strong>Total:</strong> <span className="text-red-600">Rs. {Number(order.total).toFixed(2)}</span>
        </p>
        <div className="max-h-64 overflow-y-auto mb-4 border rounded p-3 bg-gray-50">
          {items.length === 0 ? (
            <p className="text-gray-500">No items in this order.</p>
          ) : (
            items.map((item) => (
              <div key={item.id || item.book_id} className="flex gap-4 mb-3">
                <img
                  src={item.cover_image || item.dataset_image_url || "https://via.placeholder.com/150x220?text=No+Cover"}
                  alt={item.book_title}
                  className="w-14 h-20 object-contain rounded shadow"
                />
                <div>
                  <p className="font-semibold">{item.book_title}</p>
                  <p className="text-sm text-gray-700">Qty: {item.quantity}</p>
                  <p className="text-sm text-indigo-700 font-semibold">Rs. {Number(item.price).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {order.status.toLowerCase() === "pending" && (
          <button
            onClick={() => onCancel(order.id)}
            className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Cancel Order
          </button>
        )}

        <button onClick={onClose} className="mt-4 w-full py-3 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition">
          Close
        </button>
      </div>
    </div>
  );
}

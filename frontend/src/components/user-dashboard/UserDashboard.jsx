import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function UserDashboard() {
  const reviewMenuRef = useRef(null);
  const overviewRef = useRef(null);
  const ordersRef = useRef(null);
  const settingsRef = useRef(null);
  const reviewsRef = useRef(null);
  const returnsRef = useRef(null);

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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { token } = useAuth();

  // keep reviews as an array at all times
  const [reviews, setReviews] = useState([]);

  const fetchUserReviews = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:8000/books/user-reviews/", {
        headers: { Authorization: `Token ${token}` },
      });
      // response shape: { count, next, previous, results: [...] }
      setReviews(Array.isArray(res.data?.results) ? res.data.results : []);
      console.log("review", res.data);
    } catch (err) {
      toast.error("Failed to load your reviews");
      setReviews([]); // keep state consistent
    }
  };

  useEffect(() => {
    fetchUserReviews();
  }, [token]);

  // Fetch user profile
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get("http://localhost:8000/userprofile/profile/", {
          headers: { Authorization: `Token ${token}` },
        });
        setUser(res.data);
        console.log("user", res.data);
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
        setOrders(Array.isArray(res.data?.results) ? res.data.results : []);
      } catch (error) {
        toast.error("Failed to load order history.");
        console.error(error);
        setOrders([]);
      }
    }
    if (token) {
      fetchOrders();
    }
  }, [token]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (reviewMenuRef.current && !reviewMenuRef.current.contains(event.target)) {
        setReviewMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [reviewMenuRef]);

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
                    : user.profile?.avatar
                    ? `http://localhost:8000${user.profile.avatar}`
                    : "/DefaultAvatar.png"
                }
                alt={user.name || "User"}
                className="w-20 h-20 rounded-full mr-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/DefaultAvatar.png";
                }}
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
                        <td className="py-3 px-4">#{order.reference}</td>
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
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          Rs. {Number(order.total).toFixed(2)}
                        </td>
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
            <h2 className="text-xl font-bold mb-2">My Reviews</h2>
            {Array.isArray(reviews) && reviews.length === 0 ? (
              <p>There are no reviews yet.</p>
            ) : Array.isArray(reviews) ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="mb-6 border rounded p-4 bg-white shadow-sm"
                >
                  <div className="flex items-center mb-2">
                    <img
                      src={
                        review.book.cover_image?.startsWith("http")
                          ? review.book.cover_image
                          : `http://localhost:8000${review.book.cover_image}`
                      }
                      alt={review.book.title}
                      className="w-12 h-16 object-contain rounded mr-4 border"
                    />
                    <div>
                      <div className="font-semibold">{review.book.title}</div>
                      <div>{review.book.author}</div>
                      <div className="text-xs text-gray-500">
                        {review.rated_at
                          ? new Date(review.rated_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
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
                          className="absolute right-0 mt-2 w-36 bg-white shadow border rounded z-10"
                        >
                          <button
                            className="block w-full px-4 py-2 text-left hover:bg-indigo-50"
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
                            className="block w-full px-4 py-2 text-left hover:bg-red-50 text-red-700"
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
                        <AiFillStar
                          key={star}
                          size={22}
                          className="text-yellow-400"
                        />
                      ) : (
                        <AiOutlineStar
                          key={star}
                          size={22}
                          className="text-yellow-400"
                        />
                      )
                    )}
                  </div>

                  <p>{review.comment}</p>
                </div>
              ))
            ) : (
              <p>Loading reviews…</p>
            )}
          </section>

          {/* Returns/Exchanges */}
          <section ref={returnsRef} className="mb-12" id="returns">
            <h2 className="text-xl font-bold mb-2">Returns/Exchanges</h2>
            <p>
              To initiate a return or exchange, please visit the Returns Center
              or contact customer support.
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
                    Total: Rs.{" "}
                    {(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedReview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <form
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.post(
                  `http://localhost:8000/books/${selectedReview.book.id}/rate/`,
                  { rating: editRating, comment: editComment },
                  { headers: { Authorization: `Token ${token}` } }
                );
                toast.success("Review updated!");
                setShowEditModal(false);
                setSelectedReview(null);
                // Refresh reviews (keep array)
                const res = await axios.get(
                  "http://localhost:8000/books/user-reviews/",
                  { headers: { Authorization: `Token ${token}` } }
                );
                setReviews(
                  Array.isArray(res.data?.results) ? res.data.results : []
                );
              } catch (error) {
                let message = "Could not update review.";
                if (error.response && error.response.data) {
                  const data = error.response.data;
                  if (
                    data.comment &&
                    Array.isArray(data.comment) &&
                    data.comment.length > 0
                  ) {
                    message = data.comment;
                  } else if (typeof data === "string") {
                    message = data;
                  } else {
                    const firstError = Object.values(data);
                    if (Array.isArray(firstError) && firstError.length > 0) {
                      message = firstError;
                    }
                  }
                }
                toast.error(message);
              }
            }}
          >
            <h2 className="text-xl font-bold mb-4 text-indigo-700 text-center">
              Edit Review
            </h2>
            <div className="flex items-center justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="cursor-pointer"
                  onClick={() => setEditRating(star)}
                >
                  {star <= editRating ? (
                    <AiFillStar size={28} className="text-yellow-400" />
                  ) : (
                    <AiOutlineStar size={28} className="text-yellow-400" />
                  )}
                </span>
              ))}
            </div>
            <input
              type="text"
              className="border px-2 py-1 rounded w-full my-3"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Write your review (Optional)"
            />
            <div className="flex gap-2 justify-center">
              <button
                className="bg-green-600 text-white px-4 py-1 rounded"
                type="submit"
              >
                Save
              </button>
              <button
                className="bg-gray-300 px-4 py-1 rounded"
                type="button"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedReview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4 text-red-700 text-center">
              Delete Review
            </h2>
            <p className="mb-4 text-center">
              Are you sure you want to delete your review for "
              {selectedReview.book.title}"?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                className="bg-red-600 text-white px-4 py-1 rounded"
                onClick={async () => {
                  try {
                    await axios.delete(
                      `http://localhost:8000/books/reviews/${selectedReview.id}/`,
                      { headers: { Authorization: `Token ${token}` } }
                    );
                    toast.success("Review deleted!");
                    setShowDeleteModal(false);
                    setSelectedReview(null);
                    // Refresh reviews (keep array)
                    const res = await axios.get(
                      "http://localhost:8000/books/user-reviews/",
                      { headers: { Authorization: `Token ${token}` } }
                    );
                    setReviews(
                      Array.isArray(res.data?.results) ? res.data.results : []
                    );
                  } catch {
                    toast.error("Could not delete review.");
                    setShowDeleteModal(false);
                  }
                }}
              >
                Delete
              </button>
              <button
                className="bg-gray-300 px-4 py-1 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

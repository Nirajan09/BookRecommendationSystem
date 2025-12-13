import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { toast } from "react-toastify";
import { MdFavorite, MdFavoriteBorder, MdAutorenew } from "react-icons/md";
import { IoCartOutline } from "react-icons/io5";
import AddToCartModal from "../../utils/Models/AddToCartModal";
import StarRating from "../user-pages/StarRating";  // Adjust as needed

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function UserBookDetail() {
  const { id } = useParams();
  const { token, user: currUser } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  const [addingCart, setAddingCart] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [showCartModal, setShowCartModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [ratingValue, setRatingValue] = useState(0);
  const [hoverValue, setHoverValue] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [userReview, setUserReview] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOutOfStock = book?.quantity === 0;

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${backendUrl}/books/${id}/`, { headers: { Authorization: `Token ${token}` } })
      .then((res) => {
        setBook(res.data);
        const selfReview = Array.isArray(res.data.reviews)
          ? res.data.reviews.find((rv) =>
            typeof rv.user === "string"
              ? rv.user === currUser?.username
              : rv.user?.username === currUser?.username
          )
          : null;
        setUserReview(selfReview || null);
        setRatingValue(selfReview?.rating || 0);
        setReviewText(selfReview?.comment || "");
      })
      .catch((e) => {
        setError(
          e?.response?.status === 404
            ? "Book not found."
            : "Failed to load book."
        );
      });
    axios
      .get(`${backendUrl}/books/wishlist/`, { headers: { Authorization: `Token ${token}` } })
      .then((res) => {
        const items =
          Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
        const wishlistBookIds = items.map((item) =>
          typeof item.book === "number" ? item.book : item.book?.id
        );
        setIsInWishlist(wishlistBookIds.includes(Number(id)));
      })
      .catch(() => setIsInWishlist(false));
  }, [id, token, currUser]);

  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }
  function formatDateWithOrdinal(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  }

  const openCartModal = () => {
    if (isOutOfStock) return;
    setQuantity(1);
    setShowCartModal(true);
  };
  const closeCartModal = () => setShowCartModal(false);

  const handleAddToCartFromModal = async () => {
    setAddingCart(true);
    try {
      await axios.post(
        `${backendUrl}/books/cart/`,
        { book: book.id, quantity },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success(`Book added to cart!`);
      setShowCartModal(false);
      navigate("/cart");
    } catch (err) {
      toast.error("Could not add to cart.");
    } finally {
      setAddingCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    setAddingWishlist(true);
    try {
      if (isInWishlist) {
        const wlRes = await axios.get(`${backendUrl}/books/wishlist/`, { headers: { Authorization: `Token ${token}` } });
        const items = Array.isArray(wlRes.data)
          ? wlRes.data
          : Array.isArray(wlRes.data.results)
            ? wlRes.data.results
            : [];
        const wishlistItem = items.find((item) =>
          typeof item.book === "number"
            ? item.book === book.id
            : item.book?.id === book.id
        );
        if (wishlistItem) {
          await axios.delete(`${backendUrl}/books/wishlist/${wishlistItem.id}/`, { headers: { Authorization: `Token ${token}` } });
        }
        toast.success("Removed from wishlist!");
        setIsInWishlist(false);
      } else {
        await axios.post(
          `${backendUrl}/books/wishlist/`,
          { book: book.id },
          { headers: { Authorization: `Token ${token}` } }
        );
        toast.success("Added to wishlist!");
        setIsInWishlist(true);
      }
    } catch {
      toast.error("Could not update wishlist.");
    } finally {
      setAddingWishlist(false);
    }
  };

  const handleReviewSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post(
      `${backendUrl}/books/${book.id}/rate/`,
      { rating: Number(ratingValue), comment: reviewText },
      { headers: { Authorization: `Token ${token}` } }
    );
    toast.success("Review submitted!");
    // Reload book data
    const res = await axios.get(`${backendUrl}/books/${book.id}/`, {
      headers: { Authorization: `Token ${token}` }
    });
    setBook(res.data);
    const selfReview = Array.isArray(res.data.reviews)
      ? res.data.reviews.find((rv) =>
          typeof rv.user === "string"
            ? rv.user === currUser?.username
            : rv.user?.username === currUser?.username
        )
      : null;
    setUserReview(selfReview || null);
    setShowReviewModal(false);
  } catch (err) {
    // Check for validation errors from backend
    if (err.response?.data) {
      const errors = err.response.data;
      // errors can be {rating: ["..."], comment: ["..."]}
      const messages = [];
      Object.entries(errors).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((msg) => messages.push(`${key}: ${msg}`));
        } else {
          messages.push(`${key}: ${value}`);
        }
      });
      toast.error(messages.join("\n"));
    } else {
      toast.error("Could not submit review.");
    }
  }
};

  const handleDeleteReview = async () => {
    if (!userReview?.id) return;
    try {
      await axios.delete(
        `${backendUrl}/books/reviews/${userReview.id}/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success("Review deleted!");
      const updated = await axios.get(`${backendUrl}/books/${book.id}/`, { headers: { Authorization: `Token ${token}` } });
      setBook(updated.data);
      setUserReview(null);
      setReviewText("");
      setRatingValue(0);
      setShowDeleteModal(false);
    } catch {
      toast.error("Could not delete review.");
      setShowDeleteModal(false);
    }
  };

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh]">
        <div className="bg-red-100 text-red-800 rounded p-4">{error}</div>
        <Link to="/books" className="mt-4 bg-gray-200 px-4 py-2 rounded">
          Back to Explore Books
        </Link>
      </div>
    );

  if (!book)
    return (
      <div className="flex items-center justify-center min-h-[90vh]">
        <span>Loading...</span>
      </div>
    );

  // Gather passive user reviews
  const otherReviews = Array.isArray(book.reviews)
    ? book.reviews.filter(
      (rv) =>
        typeof rv.user === "string"
          ? rv.user !== currUser?.username
          : rv.user?.username !== currUser?.username
    )
    : [];

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60 px-2 py-8">
        <div className="w-full max-w-4xl bg-white/90 rounded-3xl shadow-xl p-8 border-2 border-blue-200">
          <div className="flex flex-col md:flex-row md:gap-8 gap-4 items-center md:items-start">
            <img
              src={
                book.cover_image
                  ? `${book.cover_image}`
                  : book.dataset_image_url || "https://via.placeholder.com/150x220?text=No+Cover"
              }
              alt={book.title}
              className="object-contain rounded-xl border border-gray-200 bg-gray-100 w-56 h-80 shadow"
            />
            <div className="flex-1 w-full">
              <h1 className="font-extrabold text-3xl text-gray-800 tracking-tight mb-1">{book.title}</h1>
              <div className="mb-1 text-gray-600"><b>Author:</b> {book.author}</div>
              <div className="mb-1 text-gray-600"><b>Year of Publication:</b> {book.year_of_publication || <span className="text-gray-400 italic">N/A</span>}</div>
              <div className="mb-1 text-gray-600"><b>ISBN:</b> {book.isbn}</div>
              <div className="mb-3 text-xl font-bold text-blue-600">Rs. {book.price}</div>
              <div className="flex flex-wrap gap-3 items-center mt-2">
                <button
                  onClick={openCartModal}
                  className="cursor-pointer px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition disabled:opacity-60"
                  disabled={addingCart || isOutOfStock}
                >
                  <span className="inline-flex items-center gap-2">
                    Add to Cart
                    <IoCartOutline size={22} />
                  </span>
                </button>
                <button
                  className="cursor-pointer flex items-center justify-center w-11 h-11 rounded-full border bg-blue-100 text-blue-600 hover:bg-purple-100 transition"
                  onClick={handleToggleWishlist}
                  disabled={addingWishlist}
                  aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  {addingWishlist ? (
                    <MdAutorenew size={28} className="animate-spin" />
                  ) : isInWishlist ? (
                    <MdFavorite size={28} />
                  ) : (
                    <MdFavoriteBorder size={28} />
                  )}
                </button>
                {isOutOfStock && (
                  <span className="text-red-600 font-semibold">Out of stock</span>
                )}
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="flex items-center gap-2 text-lg mt-3 mb-6">
            <span className="font-semibold text-gray-800">Average Rating:</span>
            <StarRating rating={Number(book.average_rating) || 0} />
            <span className="font-bold text-blue-700">{Number(book.average_rating).toFixed(2)} / 5</span>
          </div>

          {/* --- Reviews Section --- */}
          <div>
            <h2 className="font-bold text-xl text-blue-700 mb-3">Reviews</h2>
            {/* User Review */}
            {userReview && (
              <div className="mb-4 p-4 bg-blue-50/80 border border-blue-200 rounded-2xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <span className="font-semibold text-blue-700">Your review</span>
                  <div className="flex items-center gap-1"><StarRating rating={userReview.rating} /></div>
                  <div className="text-base">{userReview.comment}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="cursor-pointer px-5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold shadow hover:shadow-md"
                    onClick={() => setShowReviewModal(true)}
                  >Edit</button>
                  <button
                    className="cursor-pointer px-5 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow hover:shadow-md"
                    onClick={() => setShowDeleteModal(true)}
                  >Delete</button>
                </div>
              </div>
            )}

            {showReviewModal && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                <form
                  className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col gap-4"
                  onSubmit={handleReviewSubmit}
                >
                  <h2 className="text-lg font-bold text-indigo-700 text-center mb-3">Edit Review</h2>
                  {/* --- Use the fixed star input row --- */}
                  <div className="flex gap-1 justify-center mb-2" onMouseLeave={() => setHoverValue(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`cursor-pointer transition-transform ${((hoverValue || ratingValue) >= star) ? "scale-110" : ""}`}
                        onClick={() => setRatingValue(star)}
                        onMouseEnter={() => setHoverValue(star)}
                        aria-label={`${star} stars`}
                      >
                        {((hoverValue || ratingValue) >= star) ? (
                          <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                          </svg>
                        ) : (
                          <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                          </svg>
                        )}
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="border px-2 py-2 rounded w-full"
                    placeholder="Update your review (optional)"
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                  />
                  <div className="flex gap-2 justify-center mt-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-5 py-2 rounded"
                      disabled={!ratingValue}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="bg-gray-300 px-5 py-2 rounded"
                      onClick={() => setShowReviewModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Delete Review Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col gap-3">
                  <h2 className="text-lg font-bold text-red-700 text-center mb-2">Delete Review</h2>
                  <p className="mb-2 text-center">Are you sure you want to permanently delete your review?</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded"
                      onClick={handleDeleteReview}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-gray-400 text-white px-4 py-2 rounded"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add New Review Form (if not reviewed) */}
            {!userReview && (
              <form
                className="p-4 border rounded-2xl mt-3 flex flex-col gap-2 shadow bg-blue-50/60"
                onSubmit={handleReviewSubmit}
              >
                <div className="font-semibold text-blue-600 mb-1">Leave a review:</div>
                <div className="flex gap-1 items-center" onMouseLeave={() => setHoverValue(0)}>
                  <div className="flex gap-1 justify-center mb-2" onMouseLeave={() => setHoverValue(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`cursor-pointer transition-transform ${((hoverValue || ratingValue) >= star) ? "scale-110" : ""}`}
                        onClick={() => setRatingValue(star)}
                        onMouseEnter={() => setHoverValue(star)}
                        aria-label={`${star} stars`}
                      >
                        {((hoverValue || ratingValue) >= star) ? (
                          <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                          </svg>
                        ) : (
                          <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                          </svg>
                        )}
                      </span>
                    ))}
                  </div>

                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 border px-2 py-2 rounded"
                    placeholder="Write your review (optional)"
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                  />
                  <button
                    className="bg-green-600 text-white px-5 py-2 rounded"
                    type="submit"
                    disabled={!ratingValue}
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}

            {/* --- All Other Reviews (max 2 visible, scrollable if more) --- */}
            <div className="mt-6">
              <h3 className="font-bold text-lg text-blue-700 mb-2">All Reviews</h3>
              {otherReviews.length === 0 && (
                <div className="text-gray-400 text-sm text-center">No reviews yet.</div>
              )}
              <div
                className={`
                  ${otherReviews.length > 2 ? "max-h-[300px] overflow-y-auto pr-2" : ""}
                  flex flex-col gap-3
                `}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#bdb7f8 #e0e7ff"
                }}
              >
                {otherReviews.slice(0, 2).map((review, i) => (
                  <div
                    key={i}
                    className="border rounded-2xl p-3 shadow-sm bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <span className="font-semibold">{typeof review.user === "string" ? review.user : review.user?.username}</span>
                      <div className="flex items-center gap-1">
                        <StarRating rating={review.rating} />
                      </div>
                      {review.comment && <p className="mt-1 text-gray-700 text-base">{review.comment}</p>}
                    </div>
                    <div className="text-xs text-gray-400 mt-2 sm:mt-0">{review.rated_at ? formatDateWithOrdinal(review.rated_at) : ""}</div>
                  </div>
                ))}

                {otherReviews.length > 2 &&
                  otherReviews.slice(2).map((review, i) => (
                    <div
                      key={i + 2}
                      className="border rounded-2xl p-3 shadow-sm bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <span className="font-semibold">{typeof review.user === "string" ? review.user : review.user?.username}</span>
                        <div className="flex items-center gap-1">
                          <StarRating rating={review.rating} />
                        </div>
                        {review.comment && <p className="mt-1 text-gray-700 text-base">{review.comment}</p>}
                      </div>
                      <div className="text-xs text-gray-400 mt-2 sm:mt-0">{review.rated_at ? formatDateWithOrdinal(review.rated_at) : ""}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-center mt-6">
            <Link
              to="/books"
              className="bg-gradient-to-r from-blue-200 to-purple-300 hover:from-blue-300 hover:to-purple-400 text-blue-900 font-semibold px-6 py-2 rounded-lg shadow"
            >
              Back to Explore Books
            </Link>
          </div>
        </div>
      </div>
      {/* Add To Cart Modal */}
      <AddToCartModal
        open={showCartModal}
        book={book}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCartFromModal}
        adding={addingCart}
        onClose={closeCartModal}
      />
    </>
  );
}

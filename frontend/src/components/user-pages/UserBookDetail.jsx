import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { toast } from "react-toastify";
import { MdFavorite, MdFavoriteBorder, MdAutorenew } from "react-icons/md";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoCartOutline } from "react-icons/io5";
import { useForm } from "react-hook-form";
import AddToCartModal from "../../utils/Models/AddToCartModal";

const BASE_URL = "http://localhost:8000";
const HEADER_HEIGHT = 64; 

export default function UserBookDetail() {
  const { id } = useParams();
  const { token, user: currUser } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [addingCart, setAddingCart] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverValue, setHoverValue] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = book?.quantity === 0;

  const {
    reset,
  } = useForm({ defaultValues: { rating: 0, comment: "" } });

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${BASE_URL}/books/${id}/`, { headers: { Authorization: `Token ${token}` } })
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

        if (selfReview) {
          setRatingValue(selfReview.rating);
          setReviewText(selfReview.comment);
          reset({ rating: selfReview.rating, comment: selfReview.comment });
        } else {
          setRatingValue(0);
          setReviewText("");
          reset({ rating: 0, comment: "" });
        }
        setEditMode(false);
      })
      .catch((e) => {
        setError(
          e?.response?.status === 404
            ? "Book not found."
            : "Failed to load book."
        );
      });

    axios
      .get(`${BASE_URL}/books/wishlist/`, { headers: { Authorization: `Token ${token}` } })
      .then((res) => {
        const items = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.results)
            ? res.data.results
            : [];
        const wishlistBookIds = items.map((item) =>
          typeof item.book === "number" ? item.book : item.book?.id
        );
        setIsInWishlist(wishlistBookIds.includes(Number(id)));
      })
      .catch(() => setIsInWishlist(false));
  }, [id, token, currUser, reset]);

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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/books/${book.id}/rate/`,
        { rating: Number(ratingValue), comment: reviewText },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success(!editMode ? "Review updated!" : "Review submitted!");
      const res = await axios.get(`${BASE_URL}/books/${book.id}/`, { headers: { Authorization: `Token ${token}` } });
      setBook(res.data);
      const selfReview = Array.isArray(res.data.reviews)
        ? res.data.reviews.find((rv) =>
            typeof rv.user === "string"
              ? rv.user === currUser?.username
              : rv.user?.username === currUser?.username
          )
        : null;
      setUserReview(selfReview || null);
      setEditMode(false);
      setShowReviewModal(false);
    } catch (err) {
      toast.error("Could not submit review.");
    }
  };

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
        `${BASE_URL}/books/cart/`,
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
        const res = await axios.get(`${BASE_URL}/books/wishlist/`, { headers: { Authorization: `Token ${token}` } });
        const items = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.results)
            ? res.data.results
            : [];
        const wishlistItem = items.find((item) =>
          typeof item.book === "number"
            ? item.book === book.id
            : item.book?.id === book.id
        );
        if (!wishlistItem) throw new Error("Wishlist item not found.");
        await axios.delete(
          `${BASE_URL}/books/wishlist/${wishlistItem.id}/`,
          { headers: { Authorization: `Token ${token}` } }
        );
        toast.success("Removed from wishlist!");
        setIsInWishlist(false);
      } else {
        await axios.post(
          `${BASE_URL}/books/wishlist/`,
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

  const handleEdit = () => {
    setEditMode(true);
    setShowReviewModal(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (userReview) {
      setRatingValue(userReview.rating);
      setReviewText(userReview.comment);
      reset({ rating: userReview.rating, comment: userReview.comment });
    }
    setShowReviewModal(false);
  };

  const handleDelete = async () => {
    if (!userReview?.id) {
      toast.error("No review ID found.");
      setShowDeleteModal(false);
      return;
    }
    try {
      await axios.delete(
        `${BASE_URL}/books/reviews/${userReview.id}/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success("Review deleted!");
      setShowDeleteModal(false);
      const res = await axios.get(`${BASE_URL}/books/${book.id}/`, { headers: { Authorization: `Token ${token}` } });
      setBook(res.data);
      setUserReview(null);
      setReviewText("");
      setRatingValue(0);
    } catch {
      toast.error("Could not delete review.");
      setShowDeleteModal(false);
    }
  };

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-red-100 border border-red-300 text-red-800 font-semibold rounded-lg p-6 shadow">{error}</div>
        <Link to="/user-home" className="mt-6 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded shadow transition">Back to Home</Link>
      </div>
    );

  if (!book)
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <span className="text-gray-500 text-xl font-semibold">Loading...</span>
      </div>
    );

  return (
    <div
      className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white py-6 px-2"
      style={{ minHeight: `calc(100vh - ${HEADER_HEIGHT}px)` }}
    >
      <div
        className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          minHeight: `calc(80vh - ${HEADER_HEIGHT}px)`,
          maxHeight: `calc(95vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <div
          className="flex flex-row gap-0 p-8 items-start"
          style={{
            minHeight: "260px",
            alignItems: "stretch",
          }}
        >
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center"
            style={{ width: "250px", height: "260px" }}
          >
            {book.cover_image && (
              <div className="flex items-center justify-center bg-gray-100 rounded-lg shadow p-4 w-full h-full">
                <img
                  src={
                    book.cover_image.startsWith("http")
                      ? book.cover_image
                      : `${BASE_URL}${book.cover_image}`
                  }
                  alt={book.title}
                  style={{ height: "180px", width: "120px", objectFit: "contain" }}
                  className="rounded"
                />
              </div>
            )}
          </div>
          <div
            className="flex flex-col justify-between px-8 py-3 flex-1"
            style={{ minHeight: "260px" }}
          >
            <h2 className="text-2xl font-bold text-indigo-800 mb-2">{book.title}</h2>
            <div className="text-gray-700 mb-1">
              <span className="font-semibold">Author:</span> {book.author}
            </div>
            <div className="text-gray-700 mb-1">
              <span className="font-semibold">Year of Publication:</span>{" "}
              {book.year_of_publication ?? "N/A"}
            </div>
            <div className="text-gray-700 mb-1">
              <span className="font-semibold">ISBN:</span> {book.isbn}
            </div>
            <div className="text-gray-700 mb-1">
              <span className="font-semibold">Price:</span>
              <span className="text-xl text-green-700 font-bold"> Rs. {book.price}</span>
            </div>
            <div className="flex flex-row gap-4 my-3 items-center">
              <button
                onClick={openCartModal}
                disabled={addingCart || isOutOfStock}
                className={`flex gap-2 items-center font-semibold px-6 py-2 rounded-lg shadow ${
                  isOutOfStock
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                } transition`}
              >
                <IoCartOutline size={24} /> Add to Cart
              </button>
              <button
                className="flex items-center justify-center px-4 py-2 rounded-lg shadow border bg-white hover:bg-pink-50 transition"
                onClick={handleToggleWishlist}
                disabled={addingWishlist}
                aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                {addingWishlist ? (
                  <MdAutorenew size={28} className="animate-spin text-indigo-400" />
                ) : isInWishlist ? (
                  <MdFavorite size={28} className="text-pink-500" />
                ) : (
                  <MdFavoriteBorder size={28} className="text-gray-400" />
                )}
              </button>
              {isOutOfStock && <span className="text-red-600 font-bold ml-2">Item out of stock</span>}
            </div>
            <div className="mb-1">
              <span className="font-semibold">Average Rating:</span>
              {book.average_rating ? (
                <span className="text-indigo-700"> {book.average_rating} / 5</span>
              ) : (
                <span className="text-gray-400"> No rating yet</span>
              )}
            </div>
          </div>
        </div>

        {(userReview || editMode) && (
          <div className="px-8 py-4 flex flex-col">
            <span className="font-bold text-lg mb-1 mt-7">Reviews:</span>
            {userReview && !editMode && (
              <div className="my-2 p-4 bg-green-50 border border-green-200 rounded flex flex-col sm:flex-row justify-between items-center gap-2">
                <div>
                  <div className="font-semibold text-green-700">Your review</div>
                  <span className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) =>
                      star <= userReview.rating ? (
                        <AiFillStar key={star} size={22} className="text-yellow-400" />
                      ) : (
                        <AiOutlineStar key={star} size={22} className="text-yellow-400" />
                      )
                    )}
                  </span>
                  <div className="flex-1">
                    <div>{userReview.comment}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleEdit}>Edit</button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => setShowDeleteModal(true)}>Delete</button>
                </div>
              </div>
            )}
            {(editMode || !userReview) && (
              <div className="border-t pt-4 mt-2 mb-2">
                <b>{userReview ? "Edit your review:" : "Leave a review:"}</b>
                <form
                  className="mt-2 flex flex-col sm:flex-row items-center gap-2"
                  onSubmit={handleReviewSubmit}
                >
                  <div className="flex items-center" onMouseLeave={() => setHoverValue(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="cursor-pointer"
                        onClick={() => setRatingValue(star)}
                        onMouseEnter={() => setHoverValue(star)}
                      >
                        {(hoverValue || ratingValue) >= star ? (
                          <AiFillStar size={28} className="text-yellow-400" />
                        ) : (
                          <AiOutlineStar size={28} className="text-yellow-400" />
                        )}
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-60"
                    placeholder="Write your review (Optional)"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    type="submit"
                    disabled={!ratingValue}
                  >
                    {userReview ? "Save" : "Submit"}
                  </button>
                  {userReview && (
                    <button
                      type="button"
                      className="bg-gray-300 px-3 py-1 rounded"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                </form>
              </div>
            )}
            <div
              style={{
                maxHeight: "220px",
                overflowY: "auto",
                borderRadius: "0.7rem",
                background: "#f8faff",
                border: "1px solid #edf2fa",
                boxShadow: "0 0 8px 0 #f0f7ff inset",
              }}
              className="mt-2"
            >
              <h3 className="font-bold text-lg mb-2 ml-4">All Reviews</h3>
              <div className="space-y-3 pb-4">
                {Array.isArray(book.reviews) &&
                book.reviews.filter((rv) =>
                  typeof rv.user === "string"
                    ? rv.user !== currUser?.username
                    : rv.user?.username !== currUser?.username
                ).length > 0 ? (
                  book.reviews
                    ?.filter((rv) =>
                      typeof rv.user === "string"
                        ? rv.user !== currUser?.username
                        : rv.user?.username !== currUser?.username
                    )
                    .map((review, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-3 shadow-sm bg-white mx-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {typeof review.user === "string"
                              ? review.user
                              : review.user?.username}
                          </span>
                          <span className="flex items-center text-yellow-400">
                            {[1, 2, 3, 4, 5].map((num) =>
                              num <= review.rating ? (
                                <AiFillStar key={num} size={18} />
                              ) : (
                                <AiOutlineStar key={num} size={18} />
                              )
                            )}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-gray-700">{review.comment}</p>
                        )}
                        {review.rated_at && (
                          <span className="text-xs text-gray-400">
                            {formatDateWithOrdinal(review.rated_at)}
                          </span>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="text-gray-400 text-sm ml-4 mt-2">No reviews yet.</div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end px-8 py-4">
          <Link
            to="/user-home"
            className="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded-lg text-gray-800 shadow transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
      <AddToCartModal
        open={showCartModal}
        book={book}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCartFromModal}
        adding={addingCart}
        onClose={closeCartModal}
      />
    </div>
  );
}

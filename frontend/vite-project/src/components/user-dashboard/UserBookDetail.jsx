import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:8000";

export default function UserBookDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  // Cart/Wishlist
  const [addingCart, setAddingCart] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);
  const [cartMsg, setCartMsg] = useState("");
  const [wishlistMsg, setWishlistMsg] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Review/Rating
  const [ratingValue, setRatingValue] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");

  // Modal & quantity for Add to Cart
  const [showCartModal, setShowCartModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!token) return;

    // Fetch book details
    axios
      .get(`${BASE_URL}/books/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setBook(res.data))
      .catch((e) => {
        setError(
          e?.response?.status === 404 ? "Book not found." : "Failed to load book."
        );
      });

    // Fetch wishlist to check if book is in it
    axios
      .get(`${BASE_URL}/books/wishlist/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        // Assuming wishlist items have a 'book' field containing book id
        const wishlistBooks = res.data.map((item) => item.book);
        setIsInWishlist(wishlistBooks.includes(Number(id)));
      })
      .catch(() => {
        // Silently ignore wishlist fetch error
      });
  }, [id, token]);

  // Show modal and reset quantity to 1
  const openCartModal = () => {
    setQuantity(1);
    setShowCartModal(true);
  };
  const closeCartModal = () => setShowCartModal(false);

  // Add to cart API call inside modal
  const handleAddToCartFromModal = async () => {
    setAddingCart(true);
    setCartMsg("");
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
      if (err.response?.data?.quantity) {
        toast.error(err.response.data.quantity);
      } else {
        toast.error("Could not add to cart.");
      }
    } finally {
      setAddingCart(false);
    }
  };

  // Toggle wishlist handler
  const handleToggleWishlist = async () => {
  setAddingWishlist(true);
  setWishlistMsg(""); // clear any prior error message

  try {
    if (isInWishlist) {
      // Find wishlist item to delete
      const res = await axios.get(`${BASE_URL}/books/wishlist/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const wishlistItem = res.data.find((item) => item.book === book.id);
      if (!wishlistItem) {
        throw new Error("Wishlist item not found.");
      }
      await axios.delete(`${BASE_URL}/books/wishlist/${wishlistItem.id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      toast.success("Removed from wishlist!");
      setIsInWishlist(false);
    } else {
      // Add to wishlist
      await axios.post(
        `${BASE_URL}/books/wishlist/`,
        { book: book.id },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success("Added to wishlist!");
      setIsInWishlist(true);
    }
  } catch (err) {
    toast.error("Could not update wishlist.");

  } finally {
    setAddingWishlist(false);
  }
};


  // SUBMIT REVIEW
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMsg("");
    try {
      await axios.post(
        `${BASE_URL}/books/${book.id}/rate/`,
        { rating: Number(ratingValue), comment: reviewText },
        { headers: { Authorization: `Token ${token}` } }
      );
      setReviewMsg("Review submitted!");
      setRatingValue("");
      setReviewText("");
      const res = await axios.get(`${BASE_URL}/books/${book.id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setBook(res.data);
    } catch {
      setReviewMsg("Could not submit review.");
    }
  };

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh]">
        <div className="bg-red-100 text-red-800 rounded p-4">{error}</div>
        <Link to="/user-home" className="mt-4 bg-gray-200 px-4 py-2 rounded">
          Back to Home
        </Link>
      </div>
    );

  if (!book)
    return (
      <div className="flex items-center justify-center min-h-[90vh]">
        <span>Loading...</span>
      </div>
    );

  return (
    <>
      <div className="flex flex-col items-center min-h-[90vh] justify-center">
        <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm flex flex-col">
          {book.cover_image && (
            <div className="flex items-center justify-center w-full h-44 rounded mb-3">
              <img
                src={
                  book.cover_image.startsWith("http")
                    ? book.cover_image
                    : `${BASE_URL}${book.cover_image}`
                }
                alt={book.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
          <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
          <p className="mb-1">
            <b>Author:</b> {book.author}
          </p>
          <p className="mb-1">
            <b>ISBN:</b> {book.isbn}
          </p>
          <p className="mb-1">
            <b>Price:</b> ${book.price}
          </p>
          <p className="mb-4 text-gray-600">
            <b>Description:</b> {book.description}
          </p>

          {/* Actions: Cart, Wishlist */}
          <div className="flex space-x-2 my-2">
            <button
              onClick={openCartModal}
              className="bg-indigo-500 text-white px-4 py-2 rounded disabled:opacity-70"
              disabled={addingCart}
            >
              Add to Cart
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`px-4 py-2 rounded disabled:opacity-70 ${
                isInWishlist
                  ? "bg-red-500 text-white"
                  : "bg-pink-100 text-pink-600"
              }`}
              disabled={addingWishlist}
            >
              {addingWishlist
                ? "Updating..."
                : isInWishlist
                ? "Remove from Wishlist"
                : "Add to Wishlist"}
            </button>
          </div>
          {cartMsg && <div className="text-green-700 text-sm">{cartMsg}</div>}
          {wishlistMsg && (
            <div
              className={`${
                isInWishlist ? "text-red-700" : "text-pink-700"
              } text-sm`}
            >
              {wishlistMsg}
            </div>
          )}

          {/* Rating and Reviews */}
          <div className="mt-4 mb-2">
            <b>Average Rating:</b>{" "}
            {book.average_rating ? (
              <span>{book.average_rating} / 5</span>
            ) : (
              <span className="text-gray-400">No rating yet</span>
            )}
          </div>

          {/* Reviews (optional, if provided by backend) */}
          <div className="mb-4">
            <b>Reviews:</b>
            {Array.isArray(book.reviews) && book.reviews.length > 0 ? (
              <ul className="pl-4 list-disc text-sm mt-1">
                {book.reviews.map((review, i) => (
                  <li key={i}>
                    <div>
                      <span className="font-semibold">{review.user}: </span>
                      {review.comment}
                    </div>
                    {review.rating && (
                      <span className="text-yellow-600 text-xs">
                        Rating: {review.rating}/5
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 text-sm">No reviews yet.</div>
            )}
          </div>

          {/* Leave a Review */}
          <div className="border-t pt-4 mt-4 mb-2">
            <b>Leave a Review:</b>
            <form
              className="mt-2 flex flex-col sm:flex-row items-center gap-2"
              onSubmit={handleReviewSubmit}
            >
              <select
                value={ratingValue}
                onChange={(e) => setRatingValue(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                <option value="">Rating</option>
                {[1, 2, 3, 4, 5].map((num) => (
                  <option value={num} key={num}>
                    {num}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="border px-2 py-1 rounded w-60"
                placeholder="Write your review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                type="submit"
              >
                Submit
              </button>
            </form>
            {reviewMsg && (
              <div className="text-green-700 text-xs mt-1">{reviewMsg}</div>
            )}
          </div>

          <div className="flex space-x-2 mt-2">
            <Link
              to="/user-home"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Modal for Add to Cart */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-lg">
            {book.cover_image && (
              <div className="flex items-center justify-center w-full h-36 rounded mb-4">
                <img
                  src={
                    book.cover_image.startsWith("http")
                      ? book.cover_image
                      : `${BASE_URL}${book.cover_image}`
                  }
                  alt={book.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

            <h3 className="text-xl font-semibold mb-4">{book.title}</h3>
            <p>
              <b>Author:</b> {book.author}
            </p>
            <p>
              <b>Price:</b> ${book.price}
            </p>
            <p className="mb-4">
              <b>Available Quantity:</b> {book.quantity}
            </p>

            {/* Quantity selector */}
            <div className="flex items-center mb-4 space-x-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                -
              </button>
              <span className="font-semibold">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => (q < book.quantity ? q + 1 : q))
                }
                className={`px-3 py-1 rounded text-white ${
                  quantity >= book.quantity
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                disabled={quantity >= book.quantity}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCartFromModal}
              disabled={addingCart}
              className={`w-full py-2 rounded text-white font-semibold ${
                addingCart ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {addingCart ? "Adding..." : "Add to Cart"}
            </button>

            <button
              onClick={closeCartModal}
              className="w-full mt-2 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

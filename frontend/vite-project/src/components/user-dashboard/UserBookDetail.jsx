import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";

const BASE_URL = "http://localhost:8000";

export default function UserBookDetail() {
  const { id } = useParams();
  const { token } = useAuth();

  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  // Cart/Wishlist
  const [addingCart, setAddingCart] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);
  const [cartMsg, setCartMsg] = useState("");
  const [wishlistMsg, setWishlistMsg] = useState("");

  // Review/Rating
  const [ratingValue, setRatingValue] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/books/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setBook(res.data))
      .catch((e) => {
        setError(
          e?.response?.status === 404
            ? "Book not found."
            : "Failed to load book."
        );
      });
  }, [id, token]);

  // ADD TO CART
  const handleAddToCart = async () => {
    setAddingCart(true);
    setCartMsg("");
    try {
      await axios.post(
        `${BASE_URL}/books/cart/`,
        { book: book.id, quantity: 1 },
        { headers: { Authorization: `Token ${token}` } }
      );
      setCartMsg("Added to cart!");
    } catch (err) {
  setCartMsg("Could not add to cart.");
  console.error("Cart error:", err?.response?.data || err.message || err);
} finally {
      setAddingCart(false);
    }
  };

  // ADD TO WISHLIST
  const handleAddToWishlist = async () => {
    setAddingWishlist(true);
    setWishlistMsg("");
    try {
      await axios.post(
        `${BASE_URL}/books/wishlist/`,
        { book: book.id },
        { headers: { Authorization: `Token ${token}` } }
      );
      setWishlistMsg("Added to wishlist!");
    } catch (err) {
  setWishlistMsg("Could not add to wishlist.");
  console.error("Wishlist error:", err?.response?.data || err.message || err);
}finally {
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
    // Re-fetch book details to update average_rating in UI
    const res = await axios.get(
      `${BASE_URL}/books/${book.id}/`,
      { headers: { Authorization: `Token ${token}` } }
    );
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
            onClick={handleAddToCart}
            className="bg-indigo-500 text-white px-4 py-2 rounded disabled:opacity-70"
            disabled={addingCart}
          >
            {addingCart ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={handleAddToWishlist}
            className="bg-pink-100 text-pink-600 px-4 py-2 rounded disabled:opacity-70"
            disabled={addingWishlist}
          >
            {addingWishlist ? "Adding..." : "Wishlist"}
          </button>
        </div>
        {cartMsg && <div className="text-green-700 text-sm">{cartMsg}</div>}
        {wishlistMsg && (
          <div className="text-pink-700 text-sm">{wishlistMsg}</div>
        )}

        {/* Rating and Reviews */}
        <div className="mt-4 mb-2">
          <b>Average Rating:</b>{" "}
          {book.average_rating
            ? <span>{book.average_rating} / 5</span>
            : <span className="text-gray-400">No rating yet</span>
          }
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
              onChange={e => setRatingValue(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="">Rating</option>
              {[1,2,3,4,5].map(num => (
                <option value={num} key={num}>{num}</option>
              ))}
            </select>
            <input
              type="text"
              className="border px-2 py-1 rounded w-60"
              placeholder="Write your review"
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
            />
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              type="submit"
            >
              Submit
            </button>
          </form>
          {reviewMsg && <div className="text-green-700 text-xs mt-1">{reviewMsg}</div>}
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
  );
}

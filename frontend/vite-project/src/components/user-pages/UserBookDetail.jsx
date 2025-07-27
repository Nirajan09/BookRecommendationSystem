import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { toast } from "react-toastify";
import { MdFavorite, MdFavoriteBorder, MdAutorenew } from "react-icons/md";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoCartOutline } from "react-icons/io5";
import AddToCartModal from "../../utils/Models/AddToCartModal"; // Update path if needed

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
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverValue, setHoverValue] = useState(0);
  const [reviewText, setReviewText] = useState("");

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
    try {
      await axios.post(
        `${BASE_URL}/books/${book.id}/rate/`,
        { rating: Number(ratingValue), comment: reviewText },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success("Review submitted!");
      setRatingValue("");
      setReviewText("");
      const res = await axios.get(`${BASE_URL}/books/${book.id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setBook(res.data);
    } catch {
      toast.error("Could not submit review.");
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
      <div className="flex flex-col md:flex-row gap-8">
        {/* Book Cover */}
        <div className="flex-shrink-0 flex flex-col items-center"></div>
        <div className="bg-blue-50 rounded shadow-lg p-6 w-full max-w-4xl flex flex-col">
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

          {book.genres_detail && book.genres_detail.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {book.genres_detail.map((genre) => (
                <span
                  key={genre.name}
                  className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
          
          {/* Actions: Cart, Wishlist */}
          <div className="flex space-x-2 my-2">
            <button
              onClick={openCartModal}
              className="cursor-pointer flex gap-4 bg-indigo-500 text-white px-4 py-2 rounded disabled:opacity-70"
              disabled={addingCart}
            >
              <span>Add to Cart</span>
              <IoCartOutline size={30} />
            </button>
            <button
              className="cursor-pointer"
              onClick={handleToggleWishlist}
              disabled={addingWishlist}
              aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              {addingWishlist ? (
                <MdAutorenew size={40} className="animate-spin" />
              ) : isInWishlist ? (
                <MdFavorite size={40} />
              ) : (
                <MdFavoriteBorder size={40} />
              )}
            </button>
          </div>
          {cartMsg && <div className="text-green-700 text-sm">{cartMsg}</div>}
          {wishlistMsg && (
            <div className={`${isInWishlist ? "text-red-700" : "text-pink-700"} text-sm`}>
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
                      <span className="flex items-center text-yellow-400 text-xs mt-0.5">
                        {[1, 2, 3, 4, 5].map((num) =>
                          num <= review.rating ? (
                            <AiFillStar key={num} size={20} />
                          ) : (
                            <AiOutlineStar key={num} size={20} />
                          )
                        )}
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
              <div className="flex items-center" onMouseLeave={() => setHoverValue(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className="cursor-pointer"
                    onClick={() => setRatingValue(star)}
                    onMouseEnter={() => {
                      if (!ratingValue || star <= ratingValue) {
                        setHoverValue(star);
                      }
                    }}
                  >
                    {((hoverValue && (!ratingValue || star <= ratingValue))
                      ? hoverValue
                      : ratingValue) >= star ? (
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
                placeholder="Write your review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                type="submit"
                disabled={!ratingValue}
              >
                Submit
              </button>
            </form>
            {/* No reviewMsg inline toast, all is via toast */}
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

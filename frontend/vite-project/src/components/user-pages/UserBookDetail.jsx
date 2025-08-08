import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { toast } from "react-toastify";
import { MdFavorite, MdFavoriteBorder, MdAutorenew } from "react-icons/md";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoCartOutline } from "react-icons/io5";
import AddToCartModal from "../../utils/Models/AddToCartModal"; // Update path if needed
import { useCart } from "../../utils/CartContext/CartContext";

const BASE_URL = "http://localhost:8000";

export default function UserBookDetail() {
  const { fetchCartCount } = useCart();
  const { id } = useParams();
  const { token, user: currUser } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  // Cart/Wishlist state (unchanged)
  const [addingCart, setAddingCart] = useState(false);
  const [addingWishlist, setAddingWishlist] = useState(false);
  const [cartMsg, setCartMsg] = useState("");
  const [wishlistMsg, setWishlistMsg] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Review/Rating state
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverValue, setHoverValue] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Add to cart modal
  const [showCartModal, setShowCartModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = book?.quantity === 0;
  // Fetch book, wishlist, and set userReview if exists
  useEffect(() => {
    if (!token) return;

    axios
      .get(`${BASE_URL}/books/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setBook(res.data);

        // Find user's own review (review.user is string or object)
        const selfReview = Array.isArray(res.data.reviews)
          ? res.data.reviews.find((rv) =>
            typeof rv.user === "string"
              ? rv.user === currUser?.username
              : rv.user?.username === currUser?.username
          )
          : null;
        setUserReview(selfReview || null);

        // If has review, set for editing view
        if (selfReview) {
          setRatingValue(selfReview.rating);
          setReviewText(selfReview.comment);
        } else {
          setRatingValue(0);
          setReviewText("");
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

    // Wishlist (unchanged)
    axios
      .get(`${BASE_URL}/books/wishlist/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        const wishlistBooks = res.data.map((item) => item.book);
        setIsInWishlist(wishlistBooks.includes(Number(id)));
      })
      .catch(() => { });
  }, [id, token, currUser]);

  // Cart modal
  const openCartModal = () => {
     if (isOutOfStock) return; // Do nothing or show a toast
  setQuantity(1);
  setShowCartModal(true);
  };
  const closeCartModal = () => setShowCartModal(false);

  // Add to cart
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
      fetchCartCount();
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

  // Wishlist
  const handleToggleWishlist = async () => {
    setAddingWishlist(true);
    setWishlistMsg("");
    try {
      if (isInWishlist) {
        const res = await axios.get(`${BASE_URL}/books/wishlist/`, {
          headers: { Authorization: `Token ${token}` },
        });
        const wishlistItem = res.data.find((item) => item.book === book.id);
        if (!wishlistItem) {
          throw new Error("Wishlist item not found.");
        }
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
    } catch (err) {
      toast.error("Could not update wishlist.");
    } finally {
      setAddingWishlist(false);
    }
  };

  // Submit review (add or edit)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/books/${book.id}/rate/`,
        { rating: Number(ratingValue), comment: reviewText },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success(!editMode ? "Review updated!" : "Review submitted!");

      // Reload book data (and thus reviews)
      const res = await axios.get(`${BASE_URL}/books/${book.id}/`, {
        headers: { Authorization: `Token ${token}` },
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
      setEditMode(false);
      setShowReviewModal(false);
    } catch {
      toast.error("Could not submit review.");
    }
  };


  // Edit and cancel
  const handleEdit = () => setEditMode(true);
  const handleCancelEdit = () => {
    setEditMode(false);
    if (userReview) {
      setRatingValue(userReview.rating);
      setReviewText(userReview.comment);
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
          <div className="flex flex-col space-x-2 my-2 justify-between">
            <div className="flex space-x-2">
              <button
                onClick={openCartModal}
                className="cursor-pointer flex gap-4 bg-indigo-500 text-white px-4 py-2 rounded disabled:opacity-70"
                disabled={addingCart || isOutOfStock}
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
                <div>
            {/* Show out of stock message */}
            {isOutOfStock && (
              <span className="text-red-600 font-semibold ml-2">Item out of stock</span>
            )}

                </div>
          </div>

          {cartMsg && <div className="text-green-700 text-sm">{cartMsg}</div>}
          {wishlistMsg && (
            <div className={`${isInWishlist ? "text-red-700" : "text-pink-700"} text-sm`}>
              {wishlistMsg}
            </div>
          )}

          {/* Average rating */}
          <div className="mt-4 mb-2">
            <b>Average Rating:</b>{" "}
            {book.average_rating ? (
              <span>{book.average_rating} / 5</span>
            ) : (
              <span className="text-gray-400">No rating yet</span>
            )}
          </div>

          {/* Play Store style review UI */}
          <div className="mb-4">
            <b>Reviews:</b>
            {/* Show user's own review first, special UI */}
            {userReview && !editMode && (
              <div className="mb-4 p-4 bg-green-50 border rounded flex flex-col sm:flex-row items-center gap-2">
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
                  <div className="font-semibold text-green-700">Your review</div>
                  <div>{userReview.comment}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => setShowReviewModal(true)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {showReviewModal && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                <form
                  className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md space-y-4"
                  onSubmit={handleReviewSubmit}
                >
                  <h2 className="text-xl font-bold mb-2 text-indigo-700 text-center">Edit Review</h2>
                  <div className="flex items-center justify-center" onMouseLeave={() => setHoverValue(0)}>
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
                    className="border px-2 py-1 rounded w-full"
                    placeholder="Write your review (Optional)"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <div className="flex gap-2 justify-center">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-1 rounded"
                    >Save</button>
                    <button
                      type="button"
                      className="bg-gray-300 px-4 py-1 rounded"
                      onClick={() => {
                        setShowReviewModal(false);
                        handleCancelEdit();
                      }}
                    >Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Delete Review Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
                  <h2 className="text-lg font-bold mb-4 text-red-700 text-center">Delete Review</h2>
                  <p className="mb-4 text-center">Are you sure you want to permanently delete your review?</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      className="bg-red-600 text-white px-4 py-1 rounded"
                      onClick={async () => {
                        try {
                          if (!userReview?.id) {
                            toast.error("No review ID found.");
                            setShowDeleteModal(false);
                            return;
                          }
                          await axios.delete(
                            `${BASE_URL}/books/reviews/${userReview.id}/`,
                            { headers: { Authorization: `Token ${token}` } }
                          );
                          toast.success("Review deleted!");
                          setShowDeleteModal(false);

                          // reload book + UI
                          const res = await axios.get(`${BASE_URL}/books/${book.id}/`, {
                            headers: { Authorization: `Token ${token}` },
                          });
                          setBook(res.data);
                          setUserReview(null);
                          setReviewText("");
                          setRatingValue(0);
                        } catch (e) {
                          toast.error("Could not delete review.");
                          setShowDeleteModal(false);
                        }
                      }}

                    >Delete</button>
                    <button
                      className="bg-gray-300 px-4 py-1 rounded"
                      onClick={() => setShowDeleteModal(false)}
                    >Cancel</button>
                  </div>
                </div>
              </div>
            )}


            {/* Edit mode or leave a review form */}
            {(editMode || !userReview) && (
              <div className="border-t pt-4 mt-4 mb-2">
                <b>{userReview ? "Edit your review:" : "Leave a review:"}</b>
                <form
                  className="mt-2 flex flex-col sm:flex-row items-center gap-2"
                  onSubmit={handleReviewSubmit}
                >
                  {/* Star input */}
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
                  {/* Review input */}
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
                    disabled={!ratingValue} // ✅ Only rating is required
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

            {/* All reviews list */}
            <div>
              {Array.isArray(book.reviews) && book.reviews.length > 0 ? (
                <ul className="pl-4 list-disc text-sm mt-1">
                  {book.reviews
                    // show user's review at top if it exists, others after
                    .sort((a, b) => {
                      const isA = a.user === currUser?.username || a.user?.username === currUser?.username;
                      const isB = b.user === currUser?.username || b.user?.username === currUser?.username;
                      if (isA && !isB) return -1;
                      if (!isA && isB) return 1;
                      return 0;
                    })
                    .map((review, i) => (
                      <li key={i} className="mb-2">
                        <div>
                          <span className="font-semibold">
                            {(typeof review.user === "string"
                              ? review.user
                              : review.user?.username) === currUser?.username
                              ? "You"
                              : typeof review.user === "string"
                                ? review.user
                                : review.user?.username
                            }:{" "}
                          </span>
                          {review.comment}
                        </div>
                        {review.rating && (
                          <span className="flex items-center text-yellow-400 text-xs mt-0.5">
                            {[1, 2, 3, 4, 5].map((num) =>
                              num <= review.rating ? (
                                <AiFillStar key={num} size={18} />
                              ) : (
                                <AiOutlineStar key={num} size={18} />
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

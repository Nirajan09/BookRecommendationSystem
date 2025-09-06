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

export default function UserBookDetail() {
  const { id } = useParams();
  const { token, user: currUser } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  // Cart/Wishlist state
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

  // Cart modal
  const [showCartModal, setShowCartModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = book?.quantity === 0;

  // React Hook Form for review
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { rating: 0, comment: "" },
  });

  const watchRating = watch("rating", ratingValue);

  // Fetch book + user review + wishlist
  useEffect(() => {
    if (!token) return;

    axios
      .get(`${BASE_URL}/books/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
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
    .get(`${BASE_URL}/books/wishlist/`, {
      headers: { Authorization: `Token ${token}` },
    })
    .then((res) => {
      // Handle paginated or normal list response:
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
    .catch((e) => {
      // Optionally handle errors
      setIsInWishlist(false);
    });
  }, [id, token, currUser, reset]);

  // Cart modal
  const openCartModal = () => {
    if (isOutOfStock) return;
    setQuantity(1);
    setShowCartModal(true);
  };
  const closeCartModal = () => setShowCartModal(false);

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

  // Wishlist
const handleToggleWishlist = async () => {
  setAddingWishlist(true);
  setWishlistMsg("");
  try {
    if (isInWishlist) {
      // Find the wishlist item ID for current book efficiently
      const res = await axios.get(`${BASE_URL}/books/wishlist/`, {
        headers: { Authorization: `Token ${token}` },
      });
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
      setIsInWishlist(false); // Set immediately on success
    } else {
      await axios.post(
        `${BASE_URL}/books/wishlist/`,
        { book: book.id },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success("Added to wishlist!");
      setIsInWishlist(true); // Set immediately on success
    }
  } catch (err) {
    toast.error("Could not update wishlist.");
  } finally {
    setAddingWishlist(false);
  }
};

  // Submit review
  const onSubmitReview = async (data) => {
    try {
      await axios.post(
        `${BASE_URL}/books/${book.id}/rate/`,
        { rating: Number(data.rating), comment: data.comment.trim() },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success(userReview ? "Review updated!" : "Review submitted!");

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

  const handleCancelEdit = () => {
    setEditMode(false);
    if (userReview) {
      setRatingValue(userReview.rating);
      setReviewText(userReview.comment);
      reset({ rating: userReview.rating, comment: userReview.comment });
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
          {/* Book Details */}
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
            <b>Year of Publication:</b>{" "}
            {book.year_of_publication ?? "N/A"}
          </p>
          <p className="mb-1">
            <b>ISBN:</b> {book.isbn}
          </p>
          <p className="mb-1">
            <b>Price:</b> ${book.price}
          </p>

          {/* Cart + Wishlist */}
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
                aria-label={
                  isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"
                }
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
            {isOutOfStock && (
              <span className="text-red-600 font-semibold ml-2">
                Item out of stock
              </span>
            )}
          </div>

          {/* Ratings */}
          <div className="mt-4 mb-2">
            <b>Average Rating:</b>{" "}
            {book.average_rating ? (
              <span>{book.average_rating} / 5</span>
            ) : (
              <span className="text-gray-400">No rating yet</span>
            )}
          </div>

          {/* Reviews */}
          <div className="mb-4">
            <b>Reviews:</b>

            {/* Own Review */}
            {userReview && !editMode && (
              <div className="mb-4 p-4 bg-green-50 border rounded flex flex-col sm:flex-row items-center gap-2">
                <span className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) =>
                    star <= userReview.rating ? (
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
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-green-700">
                    Your review
                  </div>
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

            {/* Review Modal */}
            {showReviewModal && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                <form
                  className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md space-y-4"
                  onSubmit={handleSubmit(onSubmitReview)}
                >
                  <h2 className="text-xl font-bold mb-2 text-indigo-700 text-center">
                    Edit Review
                  </h2>

                  {/* Star Input */}
                  <div
                    className="flex items-center justify-center"
                    onMouseLeave={() => setHoverValue(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="cursor-pointer"
                        onClick={() => {
                          setRatingValue(star);
                          setValue("rating", star);
                        }}
                        onMouseEnter={() => setHoverValue(star)}
                      >
                        {(hoverValue || watchRating) >= star ? (
                          <AiFillStar size={28} className="text-yellow-400" />
                        ) : (
                          <AiOutlineStar
                            size={28}
                            className="text-yellow-400"
                          />
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Hidden rating input */}
                  <input
                    type="hidden"
                    {...register("rating", {
                      required: "Rating is required",
                      min: { value: 1, message: "Min rating is 1" },
                      max: { value: 5, message: "Max rating is 5" },
                    })}
                  />

                  {/* Comment */}
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-full"
                    placeholder="Write your review"
                    {...register("comment", {
                      maxLength: {
                        value: 2000,
                        message: "Comment cannot exceed 2000 characters",
                      },
                      validate: (val) => {
                        const trimmed = val.trim();
                        if (watchRating <= 2 && trimmed.length < 20) {
                          return "Comment must be at least 20 characters for low ratings";
                        }
                        return true;
                      },
                    })}
                  />

                  {/* Error */}
                  <p className="text-red-500 text-sm">
                    {errors.rating?.message || errors.comment?.message}
                  </p>

                  <div className="flex gap-2 justify-center">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="bg-gray-300 px-4 py-1 rounded"
                      onClick={() => {
                        setShowReviewModal(false);
                        handleCancelEdit();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Inline Form */}
            {(editMode || !userReview) && (
              <div className="border-t pt-4 mt-4 mb-2">
                <b>{userReview ? "Edit your review:" : "Leave a review:"}</b>
                <form
                  className="mt-2 flex flex-col sm:flex-row items-center gap-2"
                  onSubmit={handleSubmit(onSubmitReview)}
                >
                  {/* Star Input */}
                  <div
                    className="flex items-center"
                    onMouseLeave={() => setHoverValue(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="cursor-pointer"
                        onClick={() => {
                          setRatingValue(star);
                          setValue("rating", star);
                        }}
                        onMouseEnter={() => setHoverValue(star)}
                      >
                        {(hoverValue || watchRating) >= star ? (
                          <AiFillStar size={28} className="text-yellow-400" />
                        ) : (
                          <AiOutlineStar
                            size={28}
                            className="text-yellow-400"
                          />
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Hidden rating */}
                  <input
                    type="hidden"
                    {...register("rating", {
                      required: "Rating is required",
                      min: { value: 1, message: "Min rating is 1" },
                      max: { value: 5, message: "Max rating is 5" },
                    })}
                  />

                  {/* Comment */}
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-60"
                    placeholder="Write your review (Optional)"
                    {...register("comment", {
                      maxLength: {
                        value: 2000,
                        message: "Comment cannot exceed 2000 characters",
                      },
                      validate: (val) => {
                        const trimmed = val.trim();
                        if (watchRating <= 2 && trimmed.length < 20) {
                          return "Comment must be at least 20 characters for low ratings";
                        }
                        return true;
                      },
                    })}
                  />

                  {/* Error */}
                  <p className="text-red-500 text-sm">
                    {errors.rating?.message || errors.comment?.message}
                  </p>

                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    type="submit"
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
          </div>
          <div className="flex space-x-2 mt-2"> <Link to="/user-home" className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded" > Back to Home </Link> </div>
        </div>
      </div>

      {/* Add to Cart Modal */}
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

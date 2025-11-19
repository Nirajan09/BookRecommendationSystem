import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { toast } from "react-toastify";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
export default function AdminBookDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [book, setBook] = useState(null);
  const navigate = useNavigate();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const fetchBook = () => {
    axios
      .get(`${backendUrl}/books/admin/books/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      })
      .then((res) => setBook(res.data))
      .catch(() => navigate("/admin/books"));
  };

  useEffect(() => {
    fetchBook();
  }, [id, token, navigate]);

  const openDeleteDialog = (reviewId) => {
    setSelectedReviewId(reviewId);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedReviewId(null);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedReviewId) return;
    try {
      await axios.delete(`${backendUrl}/books/reviews/${selectedReviewId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      toast.success("Review deleted");
      fetchBook();
      closeDeleteDialog();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  if (!book)
    return (
      <div className="flex items-center justify-center min-h-[90vh] text-gray-500">
        Loading...
      </div>
    );

  return (
    <div className="bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60 flex flex-col items-center justify-center py-8 px-2 min-h-screen">
      <div className="w-full max-w-5xl bg-white/90 rounded-3xl shadow-xl border-2 border-blue-200 p-8">
        <div className="flex flex-col md:flex-row md:gap-8 gap-6 items-center md:items-start">
          {/* Book Cover */}
          <img
            src={
              book.cover_image
                ? (book.cover_image.startsWith("http") ? book.cover_image : `${backendUrl}${book.cover_image}`)
                : "https://via.placeholder.com/150x220?text=No+Cover"
            }
            alt={book.title}
            className="object-contain rounded-xl border border-gray-200 bg-gray-100 w-56 h-80 shadow"
          />

          {/* Book Info */}
          <div className="flex-1 w-full">
            <h1 className="font-extrabold text-3xl text-gray-800 tracking-tight mb-2">{book.title}</h1>
            <p className="mb-1 text-gray-600"><b>Author:</b> {book.author}</p>
            <p className="mb-1 text-gray-600"><b>Year of Publication:</b> {book.year_of_publication || <span className="text-gray-400 italic">N/A</span>}</p>
            <p className="mb-1 text-gray-600"><b>ISBN:</b> {book.isbn}</p>
            <p className="mb-3 text-xl font-bold text-blue-600">Rs. {book.price}</p>
            <p className={`mb-4 ${book.quantity === 0 ? "text-red-600" : "text-gray-600"}`}>
              <b>Quantity in Stock:</b> {book.quantity === 0 ? "Out of Stock" : book.quantity}
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                to={`/admin/books/${book.id}/edit`}
                className="cursor-pointer px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition"
              >
                Edit Book
              </Link>
              <Link
                to="/admin/books"
                className="cursor-pointer px-6 py-2 bg-blue-100 hover:bg-purple-100 text-blue-600 font-semibold rounded-xl transition"
              >
                Back to List
              </Link>
            </div>
          </div>
        </div>

        {/* User Reviews Section */}
        <div className="mt-10">
          <h2 className="text-blue-700 font-bold text-2xl mb-4">User Reviews</h2>
          {book.reviews && book.reviews.length > 0 ? (
            <ul className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-blue-100">
              {book.reviews.map((review) => (
                <li
                  key={review.id}
                  className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center"
                >
                  <div>
                    <span className="font-semibold text-gray-800">{typeof review.user === "string" ? review.user : review.user?.username}</span>
                    <div className="text-blue-600 font-semibold">{review.rating} / 5</div>
                    {review.comment && <p className="mt-1 text-gray-700 italic">{review.comment}</p>}
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <button
                      onClick={() => openDeleteDialog(review.id)}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                    >
                      Delete Review
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No reviews yet.</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Delete Review</h3>
            <p className="text-gray-600">Are you sure you want to delete this review? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeDeleteDialog}
                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";

export default function BookDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [book, setBook] = useState(null);
  const navigate = useNavigate();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const fetchBook = () => {
    axios
      .get(`http://localhost:8000/books/admin/books/${id}/`, {
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
      await axios.delete(`http://localhost:8000/books/reviews/${selectedReviewId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      fetchBook();
      closeDeleteDialog();
    } catch {
      alert("Failed to delete review");
    }
  };

  if (!book) return <div className="text-center py-16">Loading...</div>;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center py-6 px-4 min-h-[90vh]">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm flex flex-col">
        {book.cover_image && (
          <div className="max-w-2xl bg-white rounded-4xl p-8 shadow-xl flex items-center justify-center mb-5">
            <img
              src={
                book.cover_image.startsWith("http")
                  ? book.cover_image
                  : `http://localhost:8000${book.cover_image}`
              }
              alt={book.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}

        <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
        <p className="mb-1"><b>Author:</b> {book.author}</p>
        <p className="mb-1"><b>ISBN:</b> {book.isbn}</p>
        <p className="mb-1"><b>Price:</b> ${book.price}</p>
        <p className="mb-1">
          <b>Average Rating:</b>{" "}
          {book.average_rating && book.average_rating > 0 ? (
            <span>{Number(book.average_rating).toFixed(2)} / 5</span>
          ) : (
            <span className="text-gray-500 italic">No rating yet</span>
          )}
        </p>
        <p className="mb-1"><b>Quantity in Stock:</b> {book.quantity}</p>

        <div className="mb-4 border-t pt-2">
          <h3 className="text-lg font-semibold mb-2">User Reviews:</h3>
          {book.reviews && book.reviews.length > 0 ? (
            <ul>
              {book.reviews.map((review) => (
                <li key={review.id} className="mb-3 border-b pb-2 last:border-b-0 last:pb-0">
                  <p><strong>{review.user}</strong> rated <strong>{review.rating}/5</strong></p>
                  {review.comment && <p className="ml-2 italic text-gray-700">{review.comment}</p>}
                  <button
                    onClick={() => openDeleteDialog(review.id)}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded mt-1"
                  >
                    Delete Review
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/admin/books/${book.id}/edit`}
            className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Edit
          </Link>
          <Link
            to="/admin/books"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Back to List
          </Link>
        </div>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg space-y-4">
            <h3 className="text-lg font-semibold">Delete Review</h3>
            <p>Are you sure you want to delete this review? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteDialog}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
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

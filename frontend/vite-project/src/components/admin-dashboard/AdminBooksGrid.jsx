import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";

export default function AdminBooksGrid() {
  const [books, setBooks] = useState([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Modal state for confirming delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null); // The book to delete

  useEffect(() => {
    axios
      .get("http://localhost:8000/books/admin/books/", {
        headers: { Authorization: `Token ${token}` }
      })
      .then(res => setBooks(res.data))
      .catch(err => {
        if (err.response?.status === 403) {
          // You can use toast here too!
          navigate("/login");
        }
      });
  }, [token, navigate]);

  // When the user clicks Delete, open modal for confirmation
  const confirmDelete = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  // If user confirms, perform delete
  const handleDeleteConfirmed = async () => {
    if (!selectedBook) return;
    try {
      await axios.delete(`http://localhost:8000/books/admin/books/${selectedBook.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setBooks(books.filter(book => book.id !== selectedBook.id));
      setShowDeleteModal(false);
      setSelectedBook(null);
    } catch {
      // You can use toast.error() here!
      setShowDeleteModal(false);
      setSelectedBook(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedBook(null);
  };

  return (
    <div className="min-h-[90vh] bg-gray-100 px-2 md:px-8 py-8">
      <section className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-indigo-700">Manage Books</h2>
          <div className="flex gap-6">

            <Link
              to="/admin/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
            >Continue to Dashboard</Link>
            <Link
              to="/admin/books/add"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
            >Add Book</Link>
          </div>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map(book => (
            <div
              key={book.id}
              className="bg-white rounded shadow p-4 flex flex-col items-center transition hover:shadow-lg min-h-[380px]"
            >
              {/* Cover Image */}
              {book.cover_image ? (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full h-60 object-contain rounded mb-2"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded mb-2 text-gray-400 text-4xl">
                  <span role="img" aria-label="no cover">📕</span>
                </div>
              )}

              {/* Main Info */}
              <h3 className="font-semibold text-lg text-center mb-1">{book.title}</h3>
              <p className="text-gray-700 text-center mb-1"><b>Author:</b> {book.author}</p>
              <p className="text-indigo-700 font-semibold text-center mb-2"><b>Price:</b> ${book.price}</p>
              {/* Genres */}
              {book.genres_detail && book.genres_detail.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-2">
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
              {/* Action Buttons */}
              <div className="flex w-full space-x-2 mt-auto">
                <Link
                  to={`/admin/books/${book.id}`}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded w-full text-center"
                >View</Link>
                <Link
                  to={`/admin/books/${book.id}/edit`}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded w-full text-center"
                >Edit</Link>
                <button
                  onClick={() => confirmDelete(book)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded w-full text-center"
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm flex flex-col items-center">
            <p className="text-lg font-semibold text-gray-800 mb-4">Delete Book</p>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete <b>{selectedBook?.title}</b>?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteConfirmed}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold"
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-semibold"
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

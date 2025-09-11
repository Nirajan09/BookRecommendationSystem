import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { toast } from "react-toastify";

export default function AdminBooksGrid() {
  const [books, setBooks] = useState([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/books/admin/books/", {
        headers: { Authorization: `Token ${token}` }
      })
      .then(res => setBooks(res.data.results))
      .catch(err => {
        if (err.response?.status === 403) {
          navigate("/login");
        }
      });
  }, [token, navigate]);

  const confirmDelete = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedBook) return;
    try {
      await axios.delete(`http://localhost:8000/books/admin/books/${selectedBook.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setBooks(books.filter(book => book.id !== selectedBook.id));
      setShowDeleteModal(false);
      setSelectedBook(null);
      toast.success("Book deleted");
    } catch {
      setShowDeleteModal(false);
      setSelectedBook(null);
      toast.error("Failed to delete book");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedBook(null);
  };

  return (
    <div className="min-h-[90vh] bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60 px-2 md:px-8 py-8">
      <section className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Manage Books</h2>
          <div className="flex gap-6">
            <Link
              to="/admin/"
              className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:brightness-110 text-white px-4 py-2 rounded shadow transition"
            >
              Continue to Dashboard
            </Link>
            <Link
              to="/admin/books/add"
              className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:brightness-110 text-white px-4 py-2 rounded shadow transition"
            >
              Add Book
            </Link>
          </div>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/admin/books/${book.id}`)}
              className="bg-white/90 backdrop-blur border border-blue-100 rounded-2xl shadow-md p-5 flex flex-col items-center transition-transform hover:-translate-y-1 hover:shadow-xl cursor-pointer min-h-[380px]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/admin/books/${book.id}`); }}
            >
              {book.cover_image ? (
                <img
                  src={book.cover_image.startsWith("http") ? book.cover_image : `http://localhost:8000${book.cover_image}`}
                  alt={book.title}
                  className="w-full h-60 object-contain rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-40 bg-blue-50/50 flex items-center justify-center rounded-lg mb-4 text-blue-300 text-6xl select-none">
                  <span role="img" aria-label="no cover">📕</span>
                </div>
              )}
              <h3 className="font-semibold text-lg text-center text-gray-800 mb-1 line-clamp-2">{book.title}</h3>
              <p className="text-blue-700 text-center mb-1 line-clamp-1"><b>Author:</b> {book.author}</p>
              <p className="text-blue-600 font-semibold text-center mb-4"><b>Price:</b> Rs. {book.price}</p>

              <div className="flex w-full gap-3 mt-auto">
                <Link
                  to={`/admin/books/${book.id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:brightness-110 text-white px-3 py-2 rounded w-full text-center shadow transition"
                >
                  Edit
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(book);
                  }}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:brightness-110 text-white px-3 py-2 rounded w-full text-center shadow transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40 flex items-center justify-center">
          <div className="bg-white/95 rounded-3xl shadow-xl p-6 w-full max-w-sm flex flex-col items-center">
            <p className="text-lg font-semibold text-gray-800 mb-4">Delete Book</p>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete <b>{selectedBook?.title}</b>?
            </p>
            <div className="flex space-x-4 w-full justify-center">
              <button
                onClick={handleDeleteConfirmed}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-xl font-semibold shadow transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-8 py-2 rounded-xl font-semibold shadow transition"
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

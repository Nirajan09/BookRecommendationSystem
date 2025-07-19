import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";

export default function AdminBooksGrid() {
  const [books, setBooks] = useState([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8000/books/admin/books/", {
        headers: { Authorization: `Token ${token}` }
      })
      .then(res => setBooks(res.data))
      .catch(err => {
        if (err.response?.status === 403) {
          alert("Admin access only.");
          navigate("/login");
        }
      });
  }, [token, navigate]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      axios.delete(`http://localhost:8000/books/admin/books/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      })
        .then(() => setBooks(books.filter(book => book.id !== id)))
        .catch(() => alert("Delete failed."));
    }
  };

  return (
    <div className="min-h-[90vh] bg-gray-100 px-2 md:px-8 py-8">
      <section className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-indigo-700">Manage Books</h2>
          <Link
            to="/admin/books/add"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
          >Add Book</Link>
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
                  onClick={() => handleDelete(book.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded w-full text-center"
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

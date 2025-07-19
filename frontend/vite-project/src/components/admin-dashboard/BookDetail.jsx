import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";

export default function BookDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [book, setBook] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:8000/books/admin/books/${id}/`, {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => setBook(res.data))
    .catch(() => navigate("/admin/books"));
  }, [id, token, navigate]);

  if (!book) return <div className="text-center py-16">Loading...</div>;

  return (
    <div className="flex flex-col items-center min-h-[90vh] justify-center">
      <div className="bg-white rounded shadow-lg p-4 w-full max-w-sm flex flex-col">
        {book.cover_image && (
          <div className="flex items-center justify-center w-full h-44 rounded mb-3">
            <img
              src={book.cover_image}
              alt={book.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
        <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
        <p className="mb-1"><b>Author:</b> {book.author}</p>
        <p className="mb-1"><b>ISBN:</b> {book.isbn}</p>
        <p className="mb-1"><b>Price:</b> ${book.price}</p>
        <p className="mb-4 text-gray-600"><b>Description:</b> {book.description}</p>
        <div className="flex space-x-2">
          <Link to={`/admin/books/${book.id}/edit`} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded">Edit</Link>
          <Link to="/admin/books" className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Back to List</Link>
        </div>
      </div>
    </div>
  );
}

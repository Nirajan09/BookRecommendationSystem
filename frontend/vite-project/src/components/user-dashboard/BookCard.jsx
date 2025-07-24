// BookCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function BookCard({ book }) {
  return (
    <div className="bg-white rounded shadow p-4 flex flex-col items-center text-center">
      <img
        src={`http://localhost:8000${book.cover_image}`}
        alt={book.title}
        className="h-36 w-auto object-contain mb-2"
        style={{ maxWidth: 100 }}
      />
      <h3 className="font-semibold">{book.title}</h3>
      <p className="text-xs text-gray-500 mb-1">{book.author}</p>
      <span className="text-blue-700 font-bold mb-2">${book.price}</span>
      <div className="flex space-x-2">
        <Link to={`/books/${book.id}`} className="bg-blue-500 w-40 p-5  underline text-xs">View</Link>
      </div>
    </div>
  );
}

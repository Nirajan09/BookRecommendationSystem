// BookCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function BookCard({ book }) {
  return (
     <Link to={`/books/${book.id}`} className="no-underline">
    <div className="bg-white rounded-2xl shadow-lg p-5 w-64 h-100 flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-xl">
      <img
        src={`http://localhost:8000${book.cover_image}`}
        alt={book.title}
        className="h-56 w-auto object-contain rounded-xl mb-4 border border-gray-200 bg-gray-100"
        style={{ maxWidth: 150 }}
      />
      <h3 className="font-semibold text-gray-800 mb-2 w-full">{book.title}</h3>
      <p className="text-xs text-gray-500 mb-1">{book.author}</p>
      <div className="flex items-center justify-center mb-2">
  {book.average_rating ? (
    <>
      <span className="text-yellow-400 mr-1">
        {Array(Math.round(book.average_rating))
          .fill(0)
          .map((_, i) => (
            <svg key={i} className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
            </svg>
          ))}
      </span>
      <span className="text-gray-700 text-sm ml-1">{book.average_rating} / 5</span>
    </>
  ) : (
    <span className="text-gray-400 text-xs">No ratings yet</span>
  )}
</div>
      <span className="text-blue-700 font-bold text-xl mb-2">${book.price}</span>
      <div className="flex space-x-2">
        {/* <Link to={`/books/${book.id}`} className="bg-blue-500 w-40 p-5  underline text-xs">View</Link> */}
      </div>
    </div>
     </Link>
  );
}

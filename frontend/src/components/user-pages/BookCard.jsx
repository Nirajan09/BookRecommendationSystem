// BookCard.jsx
import { Link } from "react-router-dom";

const StarRating = ({ rating }) => {
  const rounded = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(rounded);
  const hasHalfStar = rounded - fullStars === 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <span className="mr-1 flex">
      {Array(fullStars)
        .fill(0)
        .map((_, i) => (
          <svg
            key={`full-${i}`}
            className="w-4 h-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
          </svg>
        ))}
      {hasHalfStar && (
        <svg key="half" className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-grad">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"
            fill="url(#half-grad)"
          />
        </svg>
      )}
      {Array(emptyStars)
        .fill(0)
        .map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-4 h-4 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
          </svg>
        ))}
    </span>
  );
};

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="no-underline">
      <div className="bg-white rounded-2xl shadow-lg p-5 w-64 h-100 flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-xl">
        <img
          src={
            book.cover_image?.startsWith("http")
              ? book.cover_image
              : `http://localhost:8000${book.cover_image}`
          }
          alt={book.title}
          className="h-56 w-auto object-contain rounded-xl mb-4 border border-gray-200 bg-gray-100"
          style={{ maxWidth: 150 }}
        />
        <h3 className="font-semibold text-gray-800 mb-2 w-full">{book.title}</h3>
        <p className="text-xs text-gray-500 mb-1">{book.author}</p>
        {/* Display year of publication if exists */}
        {book.year_of_publication && (
          <p className="text-xs text-gray-400 mb-1">Published: {book.year_of_publication}</p>
        )}
        <div className="flex items-center justify-center mb-2">
          {book.average_rating ? (
            <div className="flex items-center gap-x-2">
              <span className="text-gray-700 text-sm">{book.average_rating}</span>
              <StarRating rating={book.average_rating} />
              <span className="text-gray-700 text-sm">{book.ratings_count ?? 500}</span>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">No ratings yet</span>
          )}
        </div>
        <span className="text-blue-700 font-bold text-xl mb-2">${book.price}</span>
        <div className="flex space-x-2"></div>
      </div>
    </Link>
  );
}


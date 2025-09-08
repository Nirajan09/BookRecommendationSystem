// Recommend.jsx
import { useState } from "react";

export default function Recommend() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a book title to search.");
      setBooks([]);
      return;
    }
    setLoading(true);
    setBooks([]);
    setError("");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/recommend/?book=${encodeURIComponent(query)}`
      );
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      const data = await res.json();
      console.log("Recommend", data);
      if (data.error) {
        setError(data.error);
        setBooks([]);
      } else if (!data.recommendations || data.recommendations.length === 0) {
        setError("No recommendations found for this book.");
        setBooks([]);
      } else {
        setBooks(data.recommendations);
        setError("");
      }
    } catch (e) {
      setError("Failed to fetch recommendations. Please try again.");
      setBooks([]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60 px-4">
      <h1 className="text-3xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 animate-fade-in">
        Discover Your Next Favorite Book!
      </h1>
      <form
        onSubmit={fetchRecommendations}
        className="w-full max-w-xl mb-8 flex items-center"
      >
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"
              />
            </svg>
          </span>
          <input
            className="w-full py-3 pl-10 pr-4 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg bg-white"
            type="search"
            placeholder="Search by Book Title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="ml-4 py-3 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition focus-visible:ring-2 ring-offset-2"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200/60 aspect-[2/3] rounded-2xl shadow-lg h-72"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-10 text-red-600 font-semibold">{error}</div>
      ) : books.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {books.map((book) => (
            <div
              key={book.isbn}
              className="bg-white/90 backdrop-blur border border-blue-100 rounded-2xl shadow-md overflow-hidden group transition hover:-translate-y-1 hover:shadow-blue-100/60 hover:shadow-xl"
            >
              <img
                src={book.cover_image || book.dataset_image_url}
                alt={book.title}
                className="object-cover w-full h-56 group-hover:scale-105 transition duration-200"
              />
              <div className="p-5">
                <h2 className="font-bold text-lg line-clamp-2 mb-1">
                  {book.title}
                </h2>
                <div className="text-gray-500 text-sm mb-2 line-clamp-1">
                  By {book.author}
                </div>
                <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-600 text-xs mb-2">
                  {book.year_of_publication}
                </span>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-500">
                    {'★'.repeat(Math.round(book.average_rating || 0))}
                  </span>
                  <span className="text-gray-400">
                    ({Number(book.average_rating).toFixed(1)})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-700">${book.price}</span>
                  <span className="text-xs text-gray-500">Qty: {book.quantity}</span>
                </div>
                <button className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold shadow hover:shadow-md hover:-translate-y-0.5 transition">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center opacity-80">
          <svg
            className="mb-3 w-16 h-16 text-gray-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M..." />
          </svg>
          <p className="text-lg text-gray-500 font-medium">
            Type a book title to get personalized recommendations!
          </p>
        </div>
      )}
    </div>
  );
}

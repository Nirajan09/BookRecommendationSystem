// src/components/recommend/Recommend.jsx
import { useState } from "react";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import BookCard from "../user-pages/BookCard";

export default function Recommend() {
  const { user } = useAuth();
  console.log(user,"user")
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    if (!user) {
      setError("You must be logged in to see personalized recommendations.");
      return;
    }

    setLoading(true);
    setBooks([]);
    setError("");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/recommend/?user_id=${user.id}`, // ✅ use logged-in user id
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`, // pass token if API requires auth
          },
        }
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      console.log(data,"Recommendation")
      if (data.error) {
        setError(data.error);
        setBooks([]);
      } else if (!data.recommendations || data.recommendations.length === 0) {
        setError("No recommendations found for this user.");
        setBooks([]);
      } else {
        setBooks(data.recommendations);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch recommendations. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="mt-10 flex flex-col items-center min-h-screen bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60 px-4">

      <button
        onClick={fetchRecommendations}
        className="mb-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition focus-visible:ring-2 ring-offset-2"
      >
        Get My Recommendations
      </button>

      {loading ? (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-7xl">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200/60 aspect-[2/3] rounded-2xl shadow-lg h-72"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-10 text-red-600 font-semibold">{error}</div>
      ) : books.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center opacity-80 text-center max-w-md">
          <svg
            className="mb-3 w-16 h-16 text-gray-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
          <p className="text-lg text-gray-500 font-medium">
            Click the button to discover books tailored to your ratings.
          </p>
        </div>
      )}
    </div>
  );
}

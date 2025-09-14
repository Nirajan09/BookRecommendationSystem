import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import BookCard from "../user-pages/BookCard";

const BASE_URL = "http://localhost:8000/books";

export default function SearchResultsPage() {
  const { token } = useAuth();
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const params = new URLSearchParams(location.search);
  const searchTerm = params.get("q") || "";

  // Fetch books with pagination
  const fetchBooks = (searchTermParam, offsetParam = 0, append = false) => {
    if (!searchTermParam.trim()) {
      setResults([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const limit = 8;

    axios
      .get(`${BASE_URL}/all/`, {
        params: {
          search: searchTermParam,
          limit: limit,
          offset: offsetParam,
        },
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        // API returns paginated result with results array
        const newBooks = res.data.results || [];
        console.log(newBooks,"SearchBooks")
        setResults((prev) => (append ? [...prev, ...newBooks] : newBooks));
        setOffset(offsetParam + newBooks.length);
        setHasMore(res.data.next !== null);
      })
      .catch(() => {
        setResults([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  };

  // On searchTerm change, reset offset and results, fetch first page
  useEffect(() => {
    setOffset(0);
    setResults([]);
    setHasMore(false);
    fetchBooks(searchTerm, 0, false);
  }, [searchTerm, token]);

  // Handler to load more results
  const loadMore = () => {
    fetchBooks(searchTerm, offset, true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[70vh]">
      <h3 className="font-semibold text-lg mb-2">
        Search Results for "<span className="text-blue-600">{searchTerm}</span>"
      </h3>

      {results.length === 0 && !loading && (
        <div className="text-gray-500 mb-8">No books found.</div>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-8">
        {results.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {loading && <div className="text-gray-500 mb-4">Loading…</div>}

      {!loading && hasMore && (
        <button
          onClick={loadMore}
          className="cursor-pointer px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-md"
        >
          Load More
        </button>
      )}
    </div>
  );
}

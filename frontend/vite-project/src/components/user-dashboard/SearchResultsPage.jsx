import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import BookCard from "./BookCard";

export default function SearchResultsPage() {
  const { token } = useAuth();
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(location.search);
  const searchTerm = params.get("q") || "";

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(`http://localhost:8000/books/all/?search=${encodeURIComponent(searchTerm)}`, {
      headers: { Authorization: `Token ${token}` }
    }).then(res => {
      if (Array.isArray(res.data)) setResults(res.data);
      else if (res.data && Array.isArray(res.data.results)) setResults(res.data.results);
      else setResults([]);
    }).finally(() => setLoading(false));
  }, [searchTerm, token]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[70vh]">
      <h3 className="font-semibold text-lg mb-2">Search Results for "<span className="text-blue-600">{searchTerm}</span>"</h3>
      {loading ? (
        <div className="text-gray-500 mb-8">Loading…</div>
      ) : results.length === 0 ? (
        <div className="text-gray-500 mb-8">No books found.</div>
      ) : (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4 xl:grid-cols-6 mb-8">
          {results.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

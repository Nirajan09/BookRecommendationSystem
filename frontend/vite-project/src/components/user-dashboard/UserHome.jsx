import React, { useState, useEffect } from "react";
import axios from "axios";
import BookSearchBar from "./BookSearchBar";
import BookShelf from "./BookShelf";
import BookCard from "./BookCard";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import HeroSection from "./HeroSection"; // Adjust path if needed


export default function UserHome() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [personalized, setPersonalized] = useState([]);

  const {token}=useAuth();
  // Shelves
  useEffect(() => {
    axios.get("http://localhost:8000/books/new-releases/", { headers: { Authorization: `Token ${token}` } })
      .then(res => setNewReleases(res.data || []));
    axios.get("http://localhost:8000/books/best-sellers/", { headers: { Authorization: `Token ${token}` } })
      .then(res => setBestSellers(res.data || []));
    axios.get("http://localhost:8000/books/top-rated/", { headers: { Authorization: `Token ${token}` } })
      .then(res => setTopRated(res.data || []));
    axios.get("http://localhost:8000/books/personalized/", { headers: { Authorization: `Token ${token}` } })
      .then(res => setPersonalized(res.data || []));
  }, []);

  // Search
useEffect(() => {
  if (!searchTerm.trim()) {
    setResults([]);
    return;
  }
  axios.get(`http://localhost:8000/books/all/?search=${encodeURIComponent(searchTerm)}`, {
    headers: { Authorization: `Token ${token}` }
  }).then(res => {
    console.log("Search result:", res.data);
    // Defensive assignment:
    if (Array.isArray(res.data)) {
      setResults(res.data);
    } else if (res.data && Array.isArray(res.data.results)) {
      setResults(res.data.results);
    } else {
      setResults([]);
    }
  });
}, [searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      <BookSearchBar
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onSearch={() => setSearchTerm(query)}
      />
      {/* Hero Section */}
      <HeroSection />

      {searchTerm ? (
        <div>
          <h3 className="font-semibold text-lg mb-2">Search Results</h3>
          {results.length === 0 ? (
            <div className="text-gray-500 mb-8">No books found.</div>
          ) : (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4 xl:grid-cols-6 mb-8">
              {results.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <BookShelf title="New Releases" books={newReleases} />
          <BookShelf title="Best Sellers" books={bestSellers} />
          <BookShelf title="Top Rated" books={topRated} />
          <BookShelf title="Personalized Picks" books={personalized} />
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import BookSearchBar from "../search-box/BookSearchBar";
import BookShelf from "./BookShelf";
import BookCard from "./BookCard";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import HeroSection from "./HeroSection";
import { useNavigate } from "react-router-dom";

export default function UserHome() {
  const [newReleases, setNewReleases] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [personalized, setPersonalized] = useState([]);

  const { token } = useAuth();
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


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <HeroSection />

      <BookShelf title="New Releases" books={newReleases} />
      <BookShelf title="Best Sellers" books={bestSellers} />
      <BookShelf title="Top Rated" books={topRated} />
      <BookShelf title="Personalized Picks" books={personalized} />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import UserProfileSnapshot from "../profile-section/UserProfileSnapshot";
import { IoCartOutline } from "react-icons/io5";
import { MdFavoriteBorder } from "react-icons/md";
import axios from "axios";
import BookSearchBar from "../search-box/BookSearchBar";
const BASE_URL = "http://localhost:8000";

export default function UserHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { token, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  // Search bar:
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  // Fetch cart count when token changes
  useEffect(() => {
    if (!token) {
      setCartCount(0);
      return;
    }
    axios
      .get(`${BASE_URL}/books/cart/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        const totalItems = res.data.reduce(
          (acc, item) => acc + (item.quantity || 1),
          0
        );
        setCartCount(totalItems);
      })
      .catch(() => setCartCount(0));
  }, [token]);

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <nav className="bg-white shadow-md h-16 flex items-center px-4 md:px-8 relative z-50 justify-between">
  {/* Left: Logo */}
  <Link
    to={token ? "/user-home" : "/"}
    className="text-2xl font-bold text-blue-700 tracking-wide select-none whitespace-nowrap mr-6"
    onClick={handleLinkClick}
  >
    BookStore
  </Link>

  {token && (
    <div className="flex-1 flex justify-center items-center mt-8 h-[4vh]">
      <div className="w-full max-w-md">
        <BookSearchBar
          value={query}
          onChange={e => setQuery(e.target.value)}
          onSearch={() => {
            if (query.trim()) {
              navigate(`/search?q=${encodeURIComponent(query)}`);
              setMenuOpen(false);
            }
          }}
        />
      </div>
    </div>
  )}


  {/* Right: Nav/action links */}
  <div className="flex items-center gap-4 ml-6">
    <Link
      to={token ? "/user-home" : "/"}
      className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 hover:text-blue-800 transition"
    >
      Home
    </Link>
    {token && (
      <Link
        to="/cart"
        className="relative text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 hover:text-blue-800 transition flex items-center"
      >
        <IoCartOutline size={26} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2 py-0.5">
            {cartCount}
          </span>
        )}
      </Link>
    )}
    {token && (
      <Link
        to="/wishlist"
        className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 hover:text-blue-800 transition flex items-center"
      >
        <MdFavoriteBorder size={26} />
      </Link>
    )}
    {token && (
      <Link
        to="/dashboard"
        className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 hover:text-blue-800 transition"
      >
        Dashboard
      </Link>
    )}
    {!token && (
      <>
        <Link
          to="/register"
          className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 hover:text-blue-800 transition"
        >
          Register
        </Link>
        <Link
          to="/login"
          className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 hover:text-blue-800 transition"
        >
          Login
        </Link>
      </>
    )}
    {token && <UserProfileSnapshot />}
  </div>
</nav>
  );
}

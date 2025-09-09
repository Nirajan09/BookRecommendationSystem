import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiMenu, HiX, HiOutlineSearch, HiArrowLeft } from "react-icons/hi";
import { IoCartOutline } from "react-icons/io5";
import { MdFavoriteBorder } from "react-icons/md";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import BookSearchBar from "../search-box/BookSearchBar";
import UserProfileSnapshot from "../profile-section/UserProfileSnapshot";
import axios from "axios";
const BASE_URL = "http://localhost:8000";

export default function UserHeader() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // <-- new
  const { token } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (menuOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (!token) { setCartCount(0); return; }
    axios.get(`${BASE_URL}/books/cart/`, {
      headers: { Authorization: `Token ${token}` },
    }).then((res) => {
      const totalItems = res.data.reduce(
        (acc, item) => acc + (item.quantity || 1),
        0
      );
      setCartCount(totalItems);
    }).catch(() => setCartCount(0));
  }, [token]);

  const handleLinkClick = () => setMenuOpen(false);

  // ## 1. NAV BAR START
  return (
    <nav className="bg-white shadow-md h-16 flex items-center px-4 md:px-8 relative z-50 justify-between">
      {/* Logo */}
      <Link to={token ? "/books" : "/"} className="text-2xl font-bold text-blue-700 tracking-wide select-none whitespace-nowrap" onClick={handleLinkClick}>BookStore</Link>

      {/* SearchBar (desktop only) */}
      {token && (
        <div className="hidden lg:flex flex-[0.75] justify-center items-center mt-8">
          <div className="w-full max-w-xl">
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


      {/* Desktop Nav Links */}
      <div className="hidden lg:flex items-center gap-4 ml-6">
        <Link to={token ? "/books" : "/"} className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50">Explore Books</Link>
        {token && <Link
                to="/recommend"
                className={`flex items-center gap-2 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50`}
              >
                Recommendations
              </Link>}
        {token && <Link to="/cart" className="relative text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 flex items-center">
          <IoCartOutline size={26} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2 py-0.5">{cartCount}</span>
          )}
        </Link>}
        {token && <Link to="/wishlist" className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 flex items-center"><MdFavoriteBorder size={26} /></Link>}
        {token && <Link to="/dashboard" className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50">Dashboard</Link>}
        {!token && (
          <>
            <Link to="/register" className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50">Register</Link>
            <Link to="/login" className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50">Login</Link>
          </>
        )}
        {token && <UserProfileSnapshot />}
      </div>

      {/* --- MOBILE ONLY (md:hidden) --- */}
      <div className="flex items-center gap-2 lg:hidden">
        {/* Search Icon */}
        {token && !searchOpen && (
          <button
            className="p-2"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            <HiOutlineSearch className="w-7 h-7 text-blue-700" />
          </button>
        )}
        {/* Hamburger (hide when search bar open) */}
        {!searchOpen && (
          <button onClick={() => setMenuOpen(true)} className="p-2" aria-label="Open menu">
            <HiMenu className="w-7 h-7 text-blue-700" />
          </button>
        )}
      </div>

      {/* --- MOBILE SIDE NAV --- */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMenuOpen(false)}></div>
          <div className="ml-auto bg-white shadow-lg h-full w-64 flex flex-col relative animate-slide-in-right z-10">
            <button className="absolute top-4 right-4" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <HiX className="h-7 w-7 text-blue-700" />
            </button>
            <div className="pt-16 px-6 flex flex-col gap-4">
              <Link to={token ? "/books" : "/"} className="text-blue-700 font-medium py-2 rounded hover:bg-blue-50" onClick={handleLinkClick}>Explore books</Link>
              {token && <Link
                to="/recommend"
                className={`flex items-center gap-2 text-blue-700 font-medium py-2 rounded hover:bg-blue-50`}
              >
                Recommendations
              </Link>}
              {token &&
                <Link to="/cart" className="relative text-blue-700 font-medium py-2 rounded hover:bg-blue-50 flex items-center" onClick={handleLinkClick}>
                  <IoCartOutline size={24} />
                  <span className="ml-2">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-3 bg-red-500 text-white rounded-full text-xs px-2 py-0.5">{cartCount}</span>
                  )}
                </Link>
              }
              {token && <Link to="/wishlist" className="text-blue-700 font-medium py-2 rounded hover:bg-blue-50 flex items-center" onClick={handleLinkClick}><MdFavoriteBorder size={24} className="mr-2" />Wishlist</Link>}
              {token && <Link to="/dashboard" className="text-blue-700 font-medium py-2 rounded hover:bg-blue-50" onClick={handleLinkClick}>Dashboard</Link>}
              {!token && (
                <>
                  <Link to="/register" className="text-blue-700 font-medium py-2 rounded hover:bg-blue-50" onClick={handleLinkClick}>Register</Link>
                  <Link to="/login" className="text-blue-700 font-medium py-2 rounded hover:bg-blue-50" onClick={handleLinkClick}>Login</Link>
                </>
              )}
              {token && <div className="pt-2"><UserProfileSnapshot /></div>}
            </div>
          </div>
          <style>{`
            @keyframes slide-in-right {
              from { transform: translateX(100%); opacity:0; }
              to   { transform: translateX(0); opacity:1; }
            }
            .animate-slide-in-right {
              animation: slide-in-right 0.2s cubic-bezier(0.4,0,0.2,1);
            }
          `}</style>
        </div>
      )}

      {/* --- MOBILE SEARCH OVERLAY --- */}
      {searchOpen && (
        <div className="absolute left-0 top-0 w-full h-16 flex items-center bg-white z-20 px-4 lg:hidden">
          <button
            onClick={() => setSearchOpen(false)}
            className="mr-2 shrink-0 p-2"
            aria-label="Back"
          >
            <HiArrowLeft className="w-7 h-7 text-blue-700" />
          </button>
          <div className="flex-1 mt-8">
            <BookSearchBar
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              onSearch={() => {
                if (query.trim()) {
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                  setSearchOpen(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </nav>
  );
}

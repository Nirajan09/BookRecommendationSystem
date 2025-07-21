import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import UserProfileSnapshot from "../user-dashboard/UserProfileSnapshot";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { token, logout } = useAuth();

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <nav className="bg-white shadow-md flex items-center justify-between px-8 h-16 relative z-50">
      {/* Logo */}
      <div className="text-2xl font-bold text-blue-700 tracking-wide select-none">
        BookStore
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-5">
        <Link
          to="/"
          className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 hover:text-blue-800 transition"
        >
          Home
        </Link>
        {token && (
          <Link to="/dashboard" className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 hover:text-blue-800 transition">
            Dashboard
          </Link>
        )}
        {!token && (
          <>
            <Link to="/register" className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 hover:text-blue-800 transition">
              Register
            </Link>
            <Link to="/login" className="text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 hover:text-blue-800 transition">
              Login
            </Link>
          </>
        )}
        {token && (
          <UserProfileSnapshot/>
        )}
      </div>

      {/* Hamburger (mobile) */}
      <button
        className={`md:hidden flex flex-col justify-center items-center w-11 h-11 rounded focus:outline-none z-[101] relative group`}
        aria-label="Toggle navigation"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {/* Hamburger lines */}
        <span
          className={`block h-[3px] w-7 rounded-sm bg-blue-700 my-[3px] transition-all duration-300
            ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
        />
        <span
          className={`block h-[3px] w-7 rounded-sm bg-blue-700 my-[3px] transition-all duration-300
            ${menuOpen ? "opacity-0" : ""}`}
        />
        <span
          className={`block h-[3px] w-7 rounded-sm bg-blue-700 my-[3px] transition-all duration-300
            ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
        />
      </button>

      {/* Mobile Slide-in Menu */}
      <div className={`fixed top-0 right-0 h-screen bg-white shadow-xl z-[100] w-4/5 max-w-xs transform transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "translate-x-full"}
        flex flex-col p-8 pt-20 gap-1`}
      >
        <Link
          to="/"
          className="block text-blue-700 font-medium py-3 text-lg hover:bg-blue-50 hover:text-blue-800 rounded transition"
          onClick={handleLinkClick}
        >
          Home
        </Link>
        {token && (
          <Link
            to="/dashboard"
            className="block text-blue-700 font-medium py-3 text-lg hover:bg-blue-50 hover:text-blue-800 rounded transition"
            onClick={handleLinkClick}
          >
            Dashboard
          </Link>
        )}
        {!token && (
          <>
            <Link
              to="/register"
              className="block text-blue-700 font-medium py-3 text-lg hover:bg-blue-50 hover:text-blue-800 rounded transition"
              onClick={handleLinkClick}
            >
              Register
            </Link>
            <Link
              to="/login"
              className="block text-blue-700 font-medium py-3 text-lg hover:bg-blue-50 hover:text-blue-800 rounded transition"
              onClick={handleLinkClick}
            >
              Login
            </Link>
          </>
        )}
        {token && (
          <button
            className="block text-blue-700 font-medium py-3 text-lg text-left w-full hover:bg-blue-50 hover:text-blue-800 rounded transition"
            onClick={() => {
              logout();
              handleLinkClick();
            }}
          >
            Logout
          </button>
        )}
      </div>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-blue-300/10 z-50 transition-opacity duration-300 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}

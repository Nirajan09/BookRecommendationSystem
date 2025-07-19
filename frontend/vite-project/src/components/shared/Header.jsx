import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { token, logout } = useAuth();

  const handleLinkClick = () => setMenuOpen(false);


  return (
    <nav className="navbar">
      <div className="navbar-logo">BookStore</div>
      <button
        className={`navbar-hamburger${menuOpen ? " open" : ""}`}
        aria-label="Toggle navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`navbar-links${menuOpen ? " active" : ""}`}>
        <Link to="/" className="nav-link" onClick={handleLinkClick}>
          Home
        </Link>

        {
          token && <Link to="/dashboard" className="nav-link">Dashboard
          </Link>
        }

        {!token && (
          <>
            <Link to="/register" className="nav-link" onClick={handleLinkClick}>
              Register
            </Link>
            <Link to="/login" className="nav-link" onClick={handleLinkClick}>
              Login
            </Link>
          </>
        )}

        {token && (
          <button className="nav-link" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

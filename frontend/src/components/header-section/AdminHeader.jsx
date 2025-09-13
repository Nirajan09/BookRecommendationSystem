import { useAuth } from '../../utils/AuthContext/AuthContext';
import { Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { useState } from "react";

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  function NavCard({ to, label }) {
    return (
      <Link
        to={to}
        className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:brightness-110 text-white font-medium px-6 py-3 rounded-xl shadow-md text-center flex items-center justify-center transition"
        onClick={() => setMenuOpen(false)}
      >
        {label}
      </Link>
    );
  }

  // Show the logout confirmation modal
  const openLogoutModal = () => {
    setShowLogoutModal(true);
    setMenuOpen(false);
  };

  // Confirm logout and close modal
  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  // Cancel logout modal
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <nav className="bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60 h-[13vh] sm:h-[10vh] shadow-lg flex items-center justify-between px-6 py-3 relative z-50">
        {/* Logo */}
        <Link
          to="/admin/"
          className="text-2xl font-bold text-blue-700 tracking-wide select-none whitespace-nowrap"
          onClick={() => setMenuOpen(false)}
        >
          Bookhub
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-6">
          <Link to="/admin" className="flex items-center gap-2 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50">
            Dashboard
          </Link>
          <Link to="/admin/books" className="flex items-center gap-2 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50">
            Book Management
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-2 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50">
            Order Management
          </Link>
          <button
            onClick={openLogoutModal}
            className="flex items-center gap-2 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50"
          >
            Logout
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(true)}
          className="sm:hidden p-2 text-blue-700"
          aria-label="Open menu"
        >
          <HiMenu className="w-7 h-7" />
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg flex flex-col z-50 animate-slide-in-right">
              <button
                aria-label="Close menu"
                className="p-3 self-end text-blue-700"
                onClick={() => setMenuOpen(false)}
              >
                <HiX className="w-7 h-7" />
              </button>
              <nav className="flex flex-col gap-4 px-6 pt-4">
                <Link to="/admin" className="flex items-center gap-2 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/admin/books" className="flex items-center gap-2 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
                  Book Management
                </Link>
                <Link to="/admin/orders" className="flex items-center gap-2 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50" onClick={() => setMenuOpen(false)}>
                  Order Management
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    openLogoutModal();
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:brightness-110 text-white px-6 py-3 rounded-xl shadow-md transition text-center"
                >
                  Logout
                </button>
              </nav>
            </div>
            <style>{`
              @keyframes slide-in-right {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
              .animate-slide-in-right {
                animation: slide-in-right 0.2s cubic-bezier(0.4,0,0.2,1);
              }
            `}</style>
          </>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) cancelLogout();
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Confirm Logout</h3>
            <p className="text-gray-600">
              Are you sure you want to logout? 
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelLogout}
                className="px-5 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-5 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;

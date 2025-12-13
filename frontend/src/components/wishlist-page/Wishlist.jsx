import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { toast } from "react-toastify";
import { IoCartOutline } from "react-icons/io5";
import { MdFavorite } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AddToCartModal from "../../utils/Models/AddToCartModal";
import Loader from "../../shared/Loader";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
function RemoveConfirmModal({ open, book, onConfirm, onCancel, removing }) {
  if (!open || !book) return null;

  // Handler to close modal on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={handleBackdropClick}  // Detect clicks on backdrop only
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white/90 rounded-3xl shadow-xl p-8 w-full max-w-lg border-2 border-blue-200">
        <div className="mb-3 flex flex-col items-center">
          {/* Book Image */}
          {book.cover_image && (
            <div className="w-24 h-32 mb-3 bg-blue-50 border border-blue-200 flex items-center justify-center rounded-xl overflow-hidden">
              <img
                src={book.image || book.cover_image}
                alt={book.title}
                className="object-contain max-h-full max-w-full"
              />
            </div>
          )}
          <h3 className="text-xl font-bold text-red-600 mb-2 text-center">
            Remove from Wishlist
          </h3>
        </div>
        <p className="text-center text-gray-600 mb-6">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-gray-800">{book.title}</span> <span> by </span>
          <span className="text-blue-600 font-semibold">{book.author}</span> from your wishlist?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            onClick={onConfirm}
            disabled={removing}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow hover:from-red-600 hover:to-pink-600 transition disabled:bg-pink-300 disabled:opacity-60"
          >
            {removing ? "Removing..." : "Yes, Remove"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg bg-gray-300 text-gray-800 font-bold hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}



const Wishlist = () => {
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalBook, setModalBook] = useState(null);
  const [addQuantity, setAddQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeBook, setRemoveBook] = useState(null);
  const [removeItemId, setRemoveItemId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${backendUrl}/books/wishlist/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setWishlist(res.data.results);
      } catch {
        toast.error("Failed to load wishlist.");
      }
      setLoading(false);
    };
    if (token) fetchWishlist();
  }, [token]);

  const actuallyRemove = async () => {
    setRemovingId(removeItemId);
    try {
      await axios.delete(`${backendUrl}/books/wishlist/${removeItemId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setWishlist((prev) => prev.filter((item) => item.id !== removeItemId));
      toast.success("Removed from wishlist.");
    } catch {
      toast.error("Could not remove item.");
    } finally {
      setRemovingId(null);
      setRemoveModalOpen(false);
      setRemoveBook(null);
      setRemoveItemId(null);
    }
  };

  const handleRemove = (wishlistItemId, book) => {
    setRemoveModalOpen(true);
    setRemoveBook(book);
    setRemoveItemId(wishlistItemId);
  };

  const openAddToCartModal = (book) => {
    setModalBook(book);
    setAddQuantity(1);
    setModalOpen(true);
  };

  const handleAddToCart = async () => {
    if (!modalBook) return;
    setAdding(true);
    try {
      await axios.post(
        `${backendUrl}/books/cart/`,
        { book: modalBook.id, quantity: addQuantity },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success("Added to cart!");
      setModalOpen(false);
      setModalBook(null);
      navigate("/cart");
    } catch {
      toast.error("Could not add to cart.");
    } finally {
      setAdding(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalBook(null);
  };

  const closeRemoveModal = () => {
    setRemoveModalOpen(false);
    setRemoveBook(null);
    setRemoveItemId(null);
  };

  if (loading) {
    return <Loader/>;
  }

  if (!wishlist.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        <MdFavorite size={60} className="mx-auto text-blue-600 mb-4" />
        <div>Your wishlist is empty.</div>
      </div>
    );
  }

  return (
    <div className="mt-5 max-w-3xl mx-auto p-6 bg-white/90 rounded-3xl shadow-xl border-2 border-blue-200">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 flex items-center gap-2">
        <MdFavorite className="text-blue-600" /> My Wishlist
      </h1>
      <div
        className={`flex flex-col gap-5 ${wishlist.length > 3 ? "max-h-[450px] overflow-y-auto pr-2" : ""
          }`}
        style={
          wishlist.length > 3
            ? { scrollbarWidth: "thin", scrollbarColor: "#b3a5f7 #e0e7ff" }
            : {}
        }
      >
        {wishlist.map((item) => {
          const book = item.book_detail || {};
          return (
            <div
              key={item.id}
              className="border border-blue-200 rounded-2xl p-4 flex items-center gap-5 bg-white/90 shadow-sm"
            >
              <img
                src={
                  book.cover_image
                    ? `${book.cover_image}`
                    : book.dataset_image_url || "https://via.placeholder.com/150x220?text=No+Cover"
                }
                alt={book.title}
                className="w-20 h-28 object-contain border border-gray-200 rounded bg-blue-50/80"
              />
              <div className="flex-1">
                <div className="text-lg font-semibold text-gray-800">{book.title}</div>
                <div className="text-sm text-gray-600 mb-1">by {book.author}</div>
                <div className="font-semibold text-blue-600 mb-2">
                  Rs. {Number(book.price).toFixed(2)}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  disabled={removingId === item.id}
                  onClick={() => handleRemove(item.id, book)}
                  className="px-3 py-1 rounded bg-blue-100 text-blue-600 hover:bg-purple-100 disabled:bg-gray-300 disabled:opacity-60 text-sm transition"
                >
                  {removingId === item.id ? "Removing..." : "Remove from wishlist"}
                </button>
                <button
                  onClick={() => openAddToCartModal(book)}
                  className="px-3 py-1 rounded bg-gradient-to-r from-indigo-500 to-blue-600 text-white flex gap-2 items-center justify-center hover:from-indigo-600 hover:to-blue-700 text-sm transition"
                >
                  <IoCartOutline />
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AddToCartModal
        open={modalOpen}
        book={modalBook}
        quantity={addQuantity}
        onQuantityChange={setAddQuantity}
        onAddToCart={handleAddToCart}
        adding={adding}
        onClose={closeModal}
      />

      <RemoveConfirmModal
        open={removeModalOpen}
        book={removeBook}
        onConfirm={actuallyRemove}
        onCancel={closeRemoveModal}
        removing={removingId === removeItemId}
      />
    </div>
  );
};

export default Wishlist;

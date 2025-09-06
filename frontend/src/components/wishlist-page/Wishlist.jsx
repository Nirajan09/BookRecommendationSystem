// src/components/Wishlist.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { toast } from "react-toastify";
import { IoCartOutline } from "react-icons/io5";
import { MdFavorite } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// Modal component reused for Add to Cart
function AddToCartModal({
  open,
  book,
  quantity,
  onQuantityChange,
  onAddToCart,
  adding,
  onClose,
}) {
  if (!open || !book) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-lg">
        {book.cover_image && (
          <div className="flex items-center justify-center w-full h-36 rounded mb-4">
            <img
              src={
                book.cover_image.startsWith("http")
                  ? book.cover_image
                  : `${book.cover_image}`
              }
              alt={book.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
        <h3 className="text-xl font-semibold mb-4">{book.title}</h3>
        <p>
          <b>Author:</b> {book.author}
        </p>
        <p>
          <b>Price per unit:</b> ${Number(book.price).toFixed(2)}
        </p>
        <p className="mb-4">
          <b>Available Quantity:</b> {book.quantity ?? 1}
        </p>
        <div className="flex items-center mb-4 space-x-4">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="font-semibold">{quantity}</span>
          <button
            onClick={() =>
              onQuantityChange(
                quantity < (book.quantity || 1) ? quantity + 1 : quantity
              )
            }
            className={`px-3 py-1 rounded text-white ${
              quantity >= (book.quantity || 1)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            disabled={quantity >= (book.quantity || 1)}
          >
            +
          </button>
        </div>
        <p className="mb-4">
          <b>Total Price:</b> ${(book.price * quantity).toFixed(2)}
        </p>
        <button
          onClick={onAddToCart}
          disabled={adding}
          className={`w-full py-2 rounded text-white font-semibold ${
            adding ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>
        <button
          onClick={onClose}
          className="w-full mt-2 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-medium transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Confirmation modal for removing item from wishlist
function RemoveConfirmModal({ open, book, onConfirm, onCancel, removing }) {
  if (!open || !book) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 max-w-md w-full shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-red-600">Remove from Wishlist</h3>
        <p className="mb-2">
          Are you sure you want to remove <b>{book.title}</b> by {book.author} from your wishlist?
        </p>
        <div className="flex space-x-4 mt-4">
          <button
            onClick={onConfirm}
            disabled={removing}
            className="flex-1 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 disabled:bg-red-300"
          >
            {removing ? "Removing..." : "Yes, Remove"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const BASE_URL = "http://localhost:8000";

const Wishlist = () => {
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // Add-to-cart modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBook, setModalBook] = useState(null);
  const [addQuantity, setAddQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Remove confirmation modal state
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeBook, setRemoveBook] = useState(null);
  const [removeItemId, setRemoveItemId] = useState(null);

  const navigate = useNavigate();

  // Fetch wishlist on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/books/wishlist/`, {
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

  // Remove from wishlist (after confirmation)
  const actuallyRemove = async () => {
    setRemovingId(removeItemId);
    try {
      await axios.delete(`${BASE_URL}/books/wishlist/${removeItemId}/`, {
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

  // Open remove confirmation modal
  const handleRemove = (wishlistItemId, book) => {
    setRemoveModalOpen(true);
    setRemoveBook(book);
    setRemoveItemId(wishlistItemId);
  };

  // Add to cart modal
  const openAddToCartModal = (book) => {
    setModalBook(book);
    setAddQuantity(1);
    setModalOpen(true);
  };

  // Add to cart (from modal)
  const handleAddToCart = async () => {
    if (!modalBook) return;
    setAdding(true);
    try {
      await axios.post(
        `${BASE_URL}/books/cart/`,
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
    return <div className="p-6 text-center">Loading wishlist...</div>;
  }

  if (!wishlist.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        <MdFavorite size={60} className="mx-auto text-pink-400 mb-4" />
        <div>Your wishlist is empty.</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-pink-700 flex items-center gap-2">
        <MdFavorite className="text-pink-500" /> My Wishlist
      </h1>
      <div className="flex flex-col gap-5">
        {wishlist.map((item) => {
          const book = item.book_detail || {};
          return (
            <div
              key={item.id}
              className="border rounded p-4 flex items-center gap-5 bg-white shadow-sm"
            >
              <img
                src={
                  book.cover_image?.startsWith("http")
                    ? book.cover_image
                    : `${BASE_URL}${book.cover_image}`
                }
                alt={book.title}
                className="w-20 h-28 object-contain border rounded bg-gray-50"
              />
              <div className="flex-1">
                <div className="text-lg font-semibold">{book.title}</div>
                <div className="text-sm text-gray-600 mb-1">by {book.author}</div>
                <div className="font-semibold text-pink-700 mb-2">
                  ${Number(book.price).toFixed(2)}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  disabled={removingId === item.id}
                  onClick={() => handleRemove(item.id, book)}
                  className="px-3 py-1 rounded bg-pink-600 text-white transition hover:bg-pink-700 text-sm disabled:bg-pink-300"
                >
                  {removingId === item.id ? "Removing..." : "Remove from wishlist"}
                </button>
                <button
                  onClick={() => openAddToCartModal(book)}
                  className="px-3 py-1 rounded bg-indigo-600 text-white flex gap-2 items-center justify-center hover:bg-indigo-700 text-sm"
                >
                  <IoCartOutline />
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Add to Cart */}
      <AddToCartModal
        open={modalOpen}
        book={modalBook}
        quantity={addQuantity}
        onQuantityChange={setAddQuantity}
        onAddToCart={handleAddToCart}
        adding={adding}
        onClose={closeModal}
      />

      {/* Remove Confirmation Modal */}
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

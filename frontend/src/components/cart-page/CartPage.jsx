import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineDelete } from "react-icons/ai";
import { IoCartOutline } from "react-icons/io5";
import Loader from "../../shared/Loader";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function CartPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemPendingDelete, setItemPendingDelete] = useState(null);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/books/cart/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setCartItems(res.data.results);
      setSelectedItems(new Set());
      setSelectAll(false);
    } catch {
      toast.error("Failed to load items. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCartItems();
    // eslint-disable-next-line
  }, [token]);

  const toggleItemSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === cartItems.length && cartItems.length > 0);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
      setSelectAll(true);
    }
  };

  const updateQuantity = async (cartItem, newQuantity) => {
    if (!cartItem.book_detail || newQuantity < 1 || newQuantity > (cartItem.book_detail?.quantity ?? 1)) return;
    setUpdatingItemId(cartItem.id);
    setCartItems((prev) => prev.map((item) => (item.id === cartItem.id ? { ...item, quantity: newQuantity } : item)));

    try {
      await axios.patch(
        `${backendUrl}/books/cart/${cartItem.id}/`,
        { quantity: newQuantity },
        { headers: { Authorization: `Token ${token}` } }
      );
    } catch {
      toast.error("Quantity update failed. Reverting.");
      fetchCartItems();
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDeleteItem = async () => {
    if (deletingItemId) return;
    setDeletingItemId(itemPendingDelete);
    try {
      await axios.delete(`${backendUrl}/books/cart/${itemPendingDelete}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      toast.success("Item removed from cart.");
      fetchCartItems();
      setModalOpen(false);
      setItemPendingDelete(null);
    } catch {
      toast.error("Failed to remove item.");
    } finally {
      setDeletingItemId(null);
    }
  };

  const confirmDelete = (id) => {
    setItemPendingDelete(id);
    setModalOpen(true);
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) return;
    const selected = cartItems.filter((item) => selectedItems.has(item.id));
    toast.success(`Proceeding to checkout ${selected.length} item(s)`);
    navigate("/checkout", { state: { items: selected } });
  };

  const selectedSubtotal = cartItems.reduce((acc, item) =>
    selectedItems.has(item.id) ? acc + Number(item.book_detail?.price) * item.quantity : acc, 0);

  if (loading)
    return (
      <Loader/>
    );

  if (cartItems.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6 shadow-md">
          <IoCartOutline size={72} className="text-indigo-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Looks like you haven't added any books yet. Start browsing our collection now!
        </p>
        <button
          onClick={() => navigate("/books")}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-bold shadow hover:scale-105 hover:from-blue-600 hover:to-purple-600 transition"
        >
          Browse Books
        </button>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col min-h-[80vh]">
      <h1 className="text-4xl mb-8 font-extrabold text-gray-900 tracking-tight">Your Cart</h1>
      <div className="flex items-center mb-6 space-x-3">
        <input
          type="checkbox"
          id="select-all"
          className="w-5 h-5 accent-indigo-600 cursor-pointer rounded focus:ring-2 focus:ring-blue-400"
          checked={selectAll}
          onChange={toggleSelectAll}
        />
        <label
          htmlFor="select-all"
          className="cursor-pointer font-semibold text-gray-800 select-none"
        >
          Select All
        </label>
      </div>
      <div className="space-y-6">
        {cartItems.map(({ id, book_detail, quantity }) => (
          <div
            key={id}
            className="flex items-center border border-blue-100 rounded-2xl p-6 bg-gradient-to-tr from-blue-50/40 to-purple-50/40 shadow-lg hover:shadow-xl transition"
          >
            {/* Select */}
            <input
              type="checkbox"
              checked={selectedItems.has(id)}
              onChange={() => toggleItemSelection(id)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              aria-label={`Select ${book_detail ? book_detail.title : "book"} for checkout`}
            />

            {/* Book image */}
            {book_detail ? (
              <img
                src={
                  book_detail.cover_image
              ? `${book_detail.cover_image}`
              : book_detail.dataset_image_url || "https://via.placeholder.com/150x220?text=No+Cover"
                }
                alt={book_detail.title}
                className="ml-6 w-20 h-28 object-contain rounded-xl bg-gradient-to-tr from-white to-blue-50 shadow"
              />
            ) : (
              <div className="ml-6 w-20 h-28 bg-gray-200 rounded-xl flex items-center justify-center border">
                <span className="text-xs text-gray-500 select-none">No Image</span>
              </div>
            )}

            {/* Info */}
            <div className="flex flex-col flex-1 min-w-0 ml-6">
              <h2 className="font-bold text-lg truncate text-gray-900">{book_detail?.title || "Unknown Title"}</h2>
              <p className="text-gray-600 font-medium truncate">
                <span className="font-semibold">Author:</span> {book_detail?.author || "Unknown"}
              </p>
              <p className="text-indigo-600 font-bold mt-1">
                Rs. {Number(book_detail?.price || 0).toFixed(2)}
              </p>
              <p className="text-gray-500 mt-1"><span className="font-semibold">Available:</span> {book_detail?.quantity ?? 0}</p>
            </div>

            {/* Quantity & Delete */}
            <div className="flex flex-col items-center justify-center space-y-3 ml-6">
              <div className="flex items-center space-x-2">
                <button
                  disabled={quantity <= 1}
                  onClick={() => updateQuantity({ id, book_detail, quantity }, quantity - 1)}
                  className={`w-9 h-9 font-bold rounded-full border-2 flex items-center justify-center text-xl bg-gray-200 transition
                    ${quantity <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
                  aria-label={`Decrease quantity for ${book_detail?.title || "book"}`}
                >
                  -
                </button>
                <input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  value={quantity}
  onChange={e => {
    // Only allow digits, clamp to valid range, empty disables update
    const digits = e.target.value.replace(/\D/g, "");
    let num = digits === "" ? "" : Math.max(1, Math.min(Number(digits), book_detail?.quantity ?? 1));
    updateQuantity({ id, book_detail, quantity }, num === "" ? 1 : num);
  }}
  className="w-14 text-center font-bold bg-gradient-to-tr from-blue-100 to-purple-100 rounded-lg py-1 text-lg shadow outline-none"
  aria-label={`Set quantity for ${book_detail?.title || "book"}`}
/>

                <button
                  disabled={quantity >= (book_detail?.quantity ?? 1)}
                  onClick={() => updateQuantity({ id, book_detail, quantity }, quantity + 1)}
                  className={`w-9 h-9 font-bold rounded-full flex items-center justify-center text-xl transition
                    ${quantity >= (book_detail?.quantity ?? 1)
                      ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow"}`}
                  aria-label={`Increase quantity for ${book_detail?.title || "book"}`}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => confirmDelete(id)}
                disabled={deletingItemId === id}
                className={`p-2 rounded-full hover:bg-red-100 focus:outline-none transition
                  ${deletingItemId === id ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label={`Delete ${book_detail?.title || "book"} from cart`}
              >
                <AiOutlineDelete className="text-red-600" size={22} />
              </button>
            </div>

            {/* Item total */}
            <div className="ml-6 text-right min-w-[100px] flex flex-col justify-end items-end">
              <p className="font-bold text-xl text-blue-700">
                Rs. {(Number(book_detail?.price || 0) * quantity).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cart subtotal and checkout */}
      <div className="sticky bottom-0 z-10 mt-8 py-7 bg-white/80 backdrop-blur-xl rounded-2xl shadow flex flex-col md:flex-row justify-end items-center gap-6 border-t border-blue-100">
        <span className="font-bold text-2xl text-indigo-700">
          Subtotal: Rs. {selectedSubtotal.toFixed(2)}
        </span>
        <button
          onClick={handleCheckout}
          disabled={selectedItems.size === 0}
          className={`px-9 py-3 rounded-xl font-bold text-white transition duration-150 text-lg shadow-lg
            ${selectedItems.size === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 hover:from-blue-600 hover:to-purple-600"}`}
        >
          Checkout ({selectedItems.size})
        </button>
      </div>

      {/* Delete Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-xs mx-4 flex flex-col items-center border border-blue-100"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-semibold text-center mb-7 text-gray-800">
              Are you sure you want to remove this item from your cart?
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={handleDeleteItem}
                disabled={deletingItemId === itemPendingDelete}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-500 hover:opacity-90 text-white px-6 py-2 rounded-xl font-bold transition shadow"
              >
                {deletingItemId === itemPendingDelete ? "Removing..." : "Remove"}
              </button>
              <button
                onClick={() => setModalOpen(false)}
                disabled={deletingItemId === itemPendingDelete}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-xl font-bold transition shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
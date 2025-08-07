import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineDelete } from "react-icons/ai";
import { IoCartOutline } from "react-icons/io5";

const BASE_URL = "http://localhost:8000";

export default function CartPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [itemPendingDelete, setItemPendingDelete] = useState(null);

  // Fetch cart items on mount and token change
  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/books/cart/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setCartItems(res.data);
      setSelectedItems(new Set());
      setSelectAll(false);
    } catch {
      toast.error("Failed to load cart items.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCartItems();
    // eslint-disable-next-line
  }, [token]);

  // Toggle single cart item checkbox
  const toggleItemSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedItems(newSelected);
    setSelectAll(
      newSelected.size === cartItems.length && cartItems.length > 0
    );
  };

  // Toggle all checkboxes
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
      setSelectAll(true);
    }
  };

  // Update quantity for a cart item
  const updateQuantity = async (cartItem, newQuantity) => {
    if (
      !cartItem.book_detail ||
      newQuantity < 1 ||
      newQuantity > (cartItem.book_detail.quantity ?? 1)
    ) {
      return;
    }

    setUpdatingItemId(cartItem.id);
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItem.id ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      await axios.patch(
        `${BASE_URL}/books/cart/${cartItem.id}/`,
        { quantity: newQuantity },
        { headers: { Authorization: `Token ${token}` } }
      );
    } catch (error) {
      toast.error("Failed to update quantity.");
      fetchCartItems();
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Delete handler (after confirmation)
  const handleDeleteItem = async (cartItemId) => {
    if (deletingItemId) return;
    setDeletingItemId(cartItemId);
    try {
      await axios.delete(`${BASE_URL}/books/cart/${cartItemId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      toast.success("Item removed from cart.");
      fetchCartItems();
      setModalOpen(false);
      setItemPendingDelete(null);
    } catch (error) {
      toast.error("Failed to remove item from cart.");
    } finally {
      setDeletingItemId(null);
    }
  };

  // Show modal on delete icon click
  const confirmDelete = (cartItemId) => {
    setItemPendingDelete(cartItemId);
    setModalOpen(true);
  };

  // Handle checkout click
  const handleCheckout = () => {
  if (selectedItems.size === 0) return;

  // Get full cart items that the user selected
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));

  toast.success(`Proceeding to checkout ${selectedCartItems.length} item(s)`);
  navigate("/checkout", { state: { items: selectedCartItems } });
};


  // Calculate subtotal for selected items
  const selectedSubtotal = cartItems
    .filter((item) => selectedItems.has(item.id))
    .reduce(
      (sum, item) => sum + Number(item.book_detail?.price) * item.quantity,
      0
    );

  if (loading)
    return <div className="p-6 text-center">Loading cart...</div>;

  if (cartItems.length === 0)
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="flex items-center justify-center w-32 h-32 rounded-full bg-indigo-50 mb-4 shadow-sm">
        <IoCartOutline size={72} className="text-indigo-400" />
      </div>
      <div className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty!</div>
      <div className="text-gray-500 mb-6">
        Looks like you haven&apos;t added anything yet.<br />
        Browse our collection and get started!
      </div>
      <button
        onClick={() => navigate("/books")}
        className="px-6 py-2 bg-indigo-600 rounded text-white text-lg font-semibold shadow hover:bg-indigo-700 transition"
      >
        <span className="inline-flex items-center gap-2">
          <IoCartOutline size={22} />
          Browse Books
        </span>
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {/* Select All */}
      <div className="mb-4 flex items-center space-x-2">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={toggleSelectAll}
          id="select-all"
          className="w-5 h-5"
        />
        <label
          htmlFor="select-all"
          className="font-medium select-none cursor-pointer"
        >
          Select All
        </label>
      </div>

      {/* Cart item list */}
      <div className="flex flex-col space-y-4">
        {cartItems.map(({ id, book_detail, quantity }) => (
          <div
            key={id}
            className="border rounded p-4 flex items-center space-x-4"
          >
            <input
              type="checkbox"
              checked={selectedItems.has(id)}
              onChange={() => toggleItemSelection(id)}
              className="w-5 h-5"
            />

            {book_detail ? (
              <img
                src={
                  book_detail.cover_image?.startsWith("http")
                    ? book_detail.cover_image
                    : `${BASE_URL}${book_detail.cover_image}`
                }
                alt={book_detail.title}
                className="w-16 h-20 object-contain rounded border"
              />
            ) : (
              <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 border">
                No Image
              </div>
            )}

            <div className="flex-1 flex flex-col">
              <h2 className="font-semibold">{book_detail?.title || "Unknown Title"}</h2>
              <p className="text-sm text-gray-600">
                Author: {book_detail?.author || "Unknown"}
              </p>
              <p className="text-indigo-600 font-semibold mt-1">
                ${Number(book_detail?.price).toFixed(2)}
              </p>
              <p className="text-sm mt-1">
                Available: {book_detail?.quantity ?? 0}
              </p>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center space-x-2">
              <button
                disabled={quantity <= 1 }
                onClick={() =>
                  updateQuantity({ id, book_detail, quantity }, quantity - 1)
                }
                className={`px-3 py-1 rounded border ${
                  quantity <= 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-200"
                }`}
              >
                -
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                disabled={
                  quantity >= (book_detail?.quantity ?? 1)
                }
                onClick={() =>
                  updateQuantity({ id, book_detail, quantity }, quantity + 1)
                }
                className={`px-3 py-1 rounded text-white ${
                  quantity >= (book_detail?.quantity ?? 1) 
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                +
              </button>
            </div>

            {/* Delete button */}
            <button
              onClick={() => confirmDelete(id)}
              disabled={deletingItemId === id}
              className={`ml-4 p-1 rounded hover:bg-red-100 focus:outline-none ${
                deletingItemId === id ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="Delete item from cart"
              title="Delete item"
            >
              <AiOutlineDelete size={24} className="text-red-600" />
            </button>

            {/* Total price */}
            <div className="ml-6 text-right min-w-[90px]">
              <p className="font-semibold text-lg">
                ${(Number(book_detail?.price) * quantity).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Subtotal */}
      <div className="mt-6 flex justify-end items-center space-x-3">
        <span className="font-semibold text-xl">
          Subtotal: ${selectedSubtotal.toFixed(2)}
        </span>
      </div>

      {/* Checkout button */}
      <div className="mt-6 flex justify-end">
        <button
          disabled={selectedItems.size === 0}
          onClick={handleCheckout}
          className={`px-6 py-3 rounded text-white font-semibold transition ${
            selectedItems.size === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          Checkout ({selectedItems.size})
        </button>
      </div>
      

      {/* CONFIRMATION MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-30"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 shadow-lg min-w-[320px] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-lg font-semibold mb-4 text-gray-800">
              Are you sure you want to delete this item from the cart?
            </p>
            <div className="flex gap-4 mt-2">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded font-medium"
                onClick={() => handleDeleteItem(itemPendingDelete)}
                disabled={deletingItemId === itemPendingDelete}
              >
                {deletingItemId === itemPendingDelete ? "Deleting..." : "Yes"}
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded font-medium"
                onClick={() => setModalOpen(false)}
                disabled={deletingItemId === itemPendingDelete}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

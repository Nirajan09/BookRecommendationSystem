import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:8000";

export default function CartPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);

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
  }, [token]);

  // Toggle single cart item checkbox
  const toggleItemSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === cartItems.length && cartItems.length > 0);
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
    // Optimistic UI update first:
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
      // Revert by refetching cart
      fetchCartItems();
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Handle checkout click
  const handleCheckout = () => {
    if (selectedItems.size === 0) return;

    toast.success(`Proceeding to checkout ${selectedItems.size} item(s)`);
    navigate("/checkout", { state: { items: Array.from(selectedItems) } });
  };

  if (loading) {
    return <div className="p-6 text-center">Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="p-6 text-center">
        <p>Your cart is empty.</p>
        <button
          onClick={() => navigate("/books")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Browse Books
        </button>
      </div>
    );
  }

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

      {/* Cart items vertical list */}
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
              <p className="text-sm text-gray-600">Author: {book_detail?.author || "Unknown"}</p>
              <p className="text-indigo-600 font-semibold mt-1">${book_detail?.price ?? "0.00"}</p>
              <p className="text-sm mt-1">Available: {book_detail?.quantity ?? 0}</p>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center space-x-2">
              <button
                disabled={
                  quantity <= 1 || updatingItemId === id
                }
                onClick={() =>
                  updateQuantity({ id, book_detail, quantity }, quantity - 1)
                }
                className={`px-3 py-1 rounded border ${
                  quantity <= 1 || updatingItemId === id
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-200"
                }`}
              >
                -
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                disabled={
                  quantity >= (book_detail?.quantity ?? 1) || updatingItemId === id
                }
                onClick={() =>
                  updateQuantity({ id, book_detail, quantity }, quantity + 1)
                }
                className={`px-3 py-1 rounded text-white ${
                  quantity >= (book_detail?.quantity ?? 1) || updatingItemId === id
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout button */}
      <div className="mt-auto mt-6 flex justify-end">
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
    </div>
  );
}

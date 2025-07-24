// components/AddToCartModal.js
import React from "react";

export default function AddToCartModal({
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
          <b>Available Quantity:</b> {book.quantity}
        </p>

        {/* Quantity selector */}
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
                quantity < book.quantity ? quantity + 1 : quantity
              )
            }
            className={`px-3 py-1 rounded text-white ${
              quantity >= book.quantity
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            disabled={quantity >= book.quantity}
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
            adding
              ? "bg-gray-400"
              : "bg-indigo-600 hover:bg-indigo-700"
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

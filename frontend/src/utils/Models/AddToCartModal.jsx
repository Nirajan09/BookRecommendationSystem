export default function AddToCartModal({
  open,
  book,
  quantity,
  onQuantityChange,
  onAddToCart,
  onClose,
  adding,
}) {
  if (!open || !book) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      style={{ backdropFilter: 'blur(2px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-7 max-w-md w-full shadow-2xl border border-blue-100"
      >
        {/* Header Section */}
        <div className="flex items-center gap-5 mb-5">
          <div className="w-20 h-28 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-100/80 to-purple-100/50 shadow flex-shrink-0 border border-gray-200">
            <img
              src={
                book.cover_image
                  ? `http://127.0.0.1:8000${book.cover_image}`
                  : book.dataset_image_url || 'https://via.placeholder.com/150x220?text=No+Cover'
              }
              alt={book.title}
              className="object-contain rounded-lg shadow-md max-h-full max-w-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 leading-tight truncate" title={book.title}>
              {book.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 truncate">
              <span className="font-bold text-blue-700">by {book.author}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-between text-md font-semibold mb-2">
          <span>Price per unit:</span>
          <span className="text-blue-700 font-bold">
            Rs. {Number(book.price).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-md mb-3">
          <span>Available Quantity:</span>
          <span className="font-medium">{book.quantity}</span>
        </div>

        {/* Quantity Selection */}
        <div className="flex items-center justify-center gap-8 my-4">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-full text-lg font-bold transition disabled:opacity-60"
            aria-label="Decrease quantity"
            type="button"
          >-</button>
          <span className="font-extrabold text-2xl bg-gradient-to-br from-blue-50 to-indigo-50 px-5 py-2 rounded-lg shadow">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange(quantity < book.quantity ? quantity + 1 : quantity)}
            disabled={quantity >= book.quantity}
            className={`w-10 h-10 rounded-full text-lg font-bold transition
              ${quantity >= book.quantity
                ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'}
            `}
            aria-label="Increase quantity"
            type="button"
          >+</button>
        </div>

        <div className="flex justify-between text-lg font-semibold my-3">
          <span>Total Price:</span>
          <span className="font-bold text-indigo-700">Rs. {(book.price * quantity).toFixed(2)}</span>
        </div>

        <button
          onClick={onAddToCart}
          disabled={adding}
          className={`w-full py-3 mt-3 rounded-lg text-lg font-bold shadow-md transition
            ${adding
              ? 'bg-blue-300 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'}
          `}
        >
          {adding ? 'Adding...' : 'Add to Cart'}
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 mt-2 rounded-lg text-lg font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 shadow-md transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

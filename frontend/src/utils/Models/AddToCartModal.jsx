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
      style={{ backdropFilter: "blur(2px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-blue-100"
      >
        {/* Header: Image left, Title/Author right */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-20 h-28 flex items-center justify-center rounded-lg bg-gradient-to-tr from-blue-100/60 to-purple-50/60 flex-shrink-0">
            <img
              src={
                book.cover_image
                  ? `${book.cover_image}`
                  : book.dataset_image_url || "https://via.placeholder.com/150x220?text=No+Cover"
              }
              alt={book.title}
              className="object-contain rounded shadow max-h-full max-w-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-semibold text-gray-900 leading-tight"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.7em',
                maxHeight: '2.7em',
                lineHeight: '1.3em',
                textOverflow: 'ellipsis',
              }}
              title={book.title}
            >
              {book.title}
            </h3>
            <p className="text-sm text-gray-600 pt-1 truncate">
              <b>by {book.author}</b>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-base font-medium mb-1">
          <span>Price per unit:</span>
          <span className="text-blue-700 font-bold">Rs. {Number(book.price).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-base mb-2">
          <span>Available Quantity:</span>
          <span className="font-semibold">{book.quantity}</span>
        </div>

        {/* Quantity Input Row */}
        <div className="my-4 flex items-center justify-center gap-6">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="bg-gray-200 disabled:opacity-50 w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            type="button"
          >-</button>
          <span className="font-extrabold text-xl bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-1 rounded-md">{quantity}</span>
          <button
            onClick={() => onQuantityChange(quantity < book.quantity ? quantity + 1 : quantity)}
            disabled={quantity >= book.quantity}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition ${
              quantity >= book.quantity
                ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            aria-label="Increase quantity"
            type="button"
          >+</button>
        </div>
        <div className="flex items-center justify-between text-lg my-3">
          <span>Total Price:</span>
          <span className="font-bold text-indigo-700">Rs. {(book.price * quantity).toFixed(2)}</span>
        </div>

        <button
          onClick={onAddToCart}
          disabled={adding}
          className={`w-full py-3 mt-3 rounded-lg text-lg font-bold shadow transition ${
            adding
              ? "bg-blue-300 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          }`}
        >
          {adding ? 'Adding...' : 'Add to Cart'}
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 mt-2 rounded-lg text-lg font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 shadow transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

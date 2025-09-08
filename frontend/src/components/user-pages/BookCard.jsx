import { Link, useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import AddToCartModal from "../../utils/Models/AddToCartModal";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";

const BASE_URL = "http://localhost:8000";

export default function BookCard({ book }) {
  const { token, user: currUser } = useAuth();
  const navigate = useNavigate();
  const [showCartModal, setShowCartModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingCart, setAddingCart] = useState(false);
  const isOutOfStock = book?.quantity === 0;

  const openCartModal = () => {
    if (isOutOfStock) return;
    setQuantity(1);
    setShowCartModal(true);
  };
  const closeCartModal = () => setShowCartModal(false);

  const handleAddToCartFromModal = async () => {
    setAddingCart(true);
    try {
      await axios.post(
        `${BASE_URL}/books/cart/`,
        { book: book.id, quantity },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success(`Book added to cart!`);
      setShowCartModal(false);
      navigate("/cart");
    } catch (err) {
      toast.error("Could not add to cart.");
      console.log(err)
    } finally {
      setAddingCart(false);
    }
  };
  return (
    <>
      <Link
        to={`/books/${book.id}`}
        className="p-4 bg-white/90 backdrop-blur border border-blue-100 rounded-2xl shadow-md overflow-hidden group transition hover:-translate-y-1 hover:shadow-blue-100/60 hover:shadow-xl flex flex-col no-underline text-inherit"
      >
        <div className="bg-gray-100 flex items-center justify-center h-56 w-full overflow-hidden">
          <img
            src={
              book.cover_image
                ? `http://127.0.0.1:8000${book.cover_image}`
                : book.dataset_image_url || "https://via.placeholder.com/150x220?text=No+Cover"
            }
            alt={book.title}
            className="object-contain h-full w-full"
          />

        </div>
        <div className="p-5 flex flex-col flex-1">
          <h2 className="font-bold text-lg min-h-[3em] line-clamp-2 mb-1">{book.title}</h2>
          <div className="text-gray-500 text-sm mb-2 line-clamp-1">By {book.author}</div>
          <span className="inline-flex px-2 py-0.5 rounded bg-blue-100 text-blue-600 text-xs mb-2 w-max">
            {book.year_of_publication}
          </span>
          <div className="flex items-center space-x-2 mb-2">
            <StarRating rating={Number(book.average_rating) || 0} />
            <span className="text-gray-400">({Number(book.average_rating).toFixed(1)})</span>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className="font-semibold text-blue-700">Rs. {book.price}</span>
            <span className="text-xs text-gray-500">Qty: {book.quantity}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openCartModal();
          }}
          className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold shadow hover:shadow-md hover:-translate-y-0.5 transition"
          type="button"
          disabled={isOutOfStock}
        >
          Add to Cart
        </button>

      </Link>
      <AddToCartModal
        open={showCartModal}
        book={book}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCartFromModal}
        adding={addingCart}
        onClose={closeCartModal}
      />
    </>
  );
}

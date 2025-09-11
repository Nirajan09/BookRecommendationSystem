import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:8000";
const ITEMS_PER_BATCH = 4;

export default function AdminDashboard() {
  const { user } = useAuth();

  // Main stats state
  const [stats, setStats] = useState({
    totalSalesToday: 0,
    totalSalesMonth: 0,
    numberOfOrders: 0,
    totalRevenue: 0,
    ordersCompleted: 0,
    ordersLeft: 0,
    ordersCancelled: 0,
    averageOrderValue: 0,
    bestSellingBooks: [],
    lowStockAlerts: [],
  });

  // Pagination limits for infinite scroll
  const [bestSellingLimit, setBestSellingLimit] = useState(ITEMS_PER_BATCH);
  const [lowStockLimit, setLowStockLimit] = useState(ITEMS_PER_BATCH);

  // Selected book modal states
  const [selectedBook, setSelectedBook] = useState(null); // best-seller detail
  const [selectedLowStockBook, setSelectedLowStockBook] = useState(null); // stock update modal

  // Stock update state for modal
  const [stockQuantity, setStockQuantity] = useState(0);
  const [quantityError, setQuantityError] = useState("");
  const [updatingStock, setUpdatingStock] = useState(false);

  // Scroll refs
  const bestScrollRef = useRef(null);
  const lowStockScrollRef = useRef(null);

  // Fetch dashboard stats from backend API
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/dashboard-stats/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle lazy loading list scroll
  const handleScroll = (ref, totalItems, setLimit) => {
    const el = ref.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      setLimit((prev) => {
        if (prev >= totalItems) return prev;
        return Math.min(prev + ITEMS_PER_BATCH, totalItems);
      });
    }
  };

  // Admin quantity input validation (allows any non-negative integer)
  const onStockQuantityChange = (newQuantity) => {
    if (newQuantity < 0) {
      setQuantityError("Quantity cannot be negative.");
      return;
    }
    setQuantityError("");
    setStockQuantity(newQuantity);
  };

  // Update stock quantity API call with error handling
  const onUpdateStock = async (newQty) => {
    if (!selectedLowStockBook || !selectedLowStockBook.id) {
  alert("Invalid book selected - missing ID");
  console.log('Book object:', selectedLowStockBook);
  return;
}
    if (quantityError) return;

    setUpdatingStock(true);
    try {
      await axios.patch(
        `${API_URL}/books/${selectedLowStockBook.id}/update-stock/`,
        { quantity: newQty },
        {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        }
      );
      await fetchStats();
      
      setSelectedLowStockBook(null);
      setStockQuantity(0);
      setQuantityError("");
      alert("Stock updated successfully!");
    } catch (error) {
      setQuantityError("Failed to update stock.");
      console.error(error);
    } finally {
      setUpdatingStock(false);
    }
  };

  return (
    <div className="h-[87vh] bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60 flex flex-col p-4 gap-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 text-lg">Welcome, {user?.username}!</p>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Sales Today" value={`Rs. ${stats.totalSalesToday}`} />
        <KpiCard label="Sales This Month" value={`Rs. ${stats.totalSalesMonth}`} />
        <KpiCard label="Total Revenue" value={`Rs. ${stats.totalRevenue}`} />
        <KpiCard label="Avg. Order Value" value={`Rs. ${stats.averageOrderValue.toFixed(2)}`} />
        <KpiCard label="Orders Total" value={stats.numberOfOrders} />
        <KpiCard label="Orders Completed" value={stats.ordersCompleted} />
        <KpiCard label="Orders Left" value={stats.ordersLeft} />
        <KpiCard label="Orders Cancelled" value={stats.ordersCancelled} />
      </section>

      {/* Books Lists */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best-Selling Books */}
        <div>
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Best-Selling Books</h2>
          <div
            className="bg-white/90 border border-blue-200 rounded-2xl shadow-lg p-6"
            style={{ maxHeight: 180, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#3b82f6 transparent" }}
            ref={bestScrollRef}
            onScroll={() => handleScroll(bestScrollRef, stats.bestSellingBooks.length, setBestSellingLimit)}
          >
            {stats.bestSellingBooks.length === 0 && <p className="text-gray-500 italic">No data available</p>}
            {stats.bestSellingBooks.slice(0, bestSellingLimit).map((book, idx) => (
              <div
                key={idx}
                className="cursor-pointer hover:text-blue-600 transition flex justify-between"
                onClick={() => setSelectedBook(book)}
              >
                <span className="font-semibold truncate max-w-[70%]" title={book.title}>{book.title}</span>
                <span className="text-blue-600 font-semibold">{book.sold} sold</span>
              </div>
            ))}
            {bestSellingLimit < stats.bestSellingBooks.length && (
              <div className="text-xs text-blue-400 text-center mt-2 cursor-default">Scroll to load more...</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div>
  <h2 className="text-xl font-semibold text-blue-700 mb-4">Low Stock Alerts</h2>
  <div
    className="bg-white/90 border border-blue-200 rounded-2xl shadow-lg p-6"
    style={{ maxHeight: 220, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#3b82f6 transparent" }}
    ref={lowStockScrollRef}
    onScroll={() =>
      handleScroll(lowStockScrollRef, stats.lowStockAlerts.length, setLowStockLimit)
    }
  >
    {stats.lowStockAlerts.length === 0 && (
      <p className="text-gray-500 italic">No alerts</p>
    )}
    {stats.lowStockAlerts.slice(0, lowStockLimit).map((book, idx) => (
      <div
        key={idx}
        className="cursor-pointer hover:text-red-600 transition flex justify-between"
        onClick={() => {
          setSelectedLowStockBook(book);
          setStockQuantity(book.quantity);
          setQuantityError("");
        }}
      >
        <span
          className="font-semibold truncate max-w-[70%]"
          title={book.title}
        >
          {book.title}
        </span>
        <span className="text-red-600 font-semibold">
          {book.quantity} left
        </span>
      </div>
    ))}
    {lowStockLimit < stats.lowStockAlerts.length && (
      <div className="text-xs text-blue-400 text-center mt-2 cursor-default">
        Scroll to load more...
      </div>
    )}
  </div>
</div>
      </section>

      {/* Detail modal for best-selling books */}
      {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />}

      {/* Stock update modal for low stock books */}
      {selectedLowStockBook && (
        <UpdateStockModal
          open={!!selectedLowStockBook}
          book={selectedLowStockBook}
          quantity={stockQuantity}
          setQuantity={onStockQuantityChange}
          onUpdate={onUpdateStock}
          onClose={() => setSelectedLowStockBook(null)}
          error={quantityError}
          updating={updatingStock}
        />
      )}
    </div>
  );
}

// KPI card to display a label and value
const KpiCard = ({ label, value }) => (
  <div className="bg-white/90 border border-blue-200 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
    <span className="text-gray-600 text-sm mb-2">{label}</span>
    <span className="text-blue-600 text-3xl font-extrabold">{value}</span>
  </div>
);

// Modal to show details of a best-selling book
const BookDetailModal = ({ book, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40" onClick={onClose} style={{ backdropFilter: "blur(4px)" }}>
    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl max-w-md w-full p-6 border border-blue-100 shadow-xl">
      <div className="flex gap-4 mb-5">
        <div className="w-20 h-28 rounded-lg bg-gradient-to-tr from-blue-100/60 to-purple-50 flex items-center justify-center flex-shrink-0">
          <img src={book.cover_image_url
            ? book.cover_image_url.startsWith("http")
              ? book.cover_image_url
              : `http://127.0.0.1:8000/${book.cover_image_url}`
            : "https://via.placeholder.com/150x220?text=No+Cover"} alt={book.title} className="object-contain max-w-full max-h-full rounded shadow" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate" title={book.title}>{book.title}</h3>
          <p className="text-sm text-gray-600 truncate">by {book.author || "Unknown"}</p>
        </div>
      </div>
      <div className="mb-2 flex justify-between text-base"><span>ISBN:</span><span>{book.isbn || "N/A"}</span></div>
      <div className="mb-2 flex justify-between text-base"><span>Year of Publication:</span><span>{book.year_of_publication || "N/A"}</span></div>
      <div className="mb-2 flex justify-between text-base"><span>Price:</span><span className="text-blue-700 font-semibold">Rs. {Number(book.price).toFixed(2)}</span></div>
      <div className="mb-4 flex justify-between text-base"><span>Sold:</span><span className="font-semibold text-indigo-700">{book.sold || 0}</span></div>
      {book.description && <div className="mt-4 text-gray-700 whitespace-pre-line border-t border-blue-100 pt-4">{book.description}</div>}
      <button className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:brightness-110 text-white py-3 rounded-xl font-semibold mt-6" onClick={onClose}>
        Close
      </button>
    </div>
  </div>
);

// Modal to update stock quantity for low stock books
const UpdateStockModal = ({ open, book, quantity, setQuantity, onUpdate, onClose, error, updating }) => {
  const [inputValue, setInputValue] = React.useState(quantity);

  React.useEffect(() => {
    setInputValue(quantity);
  }, [quantity, book]);

  if (!open) return null;

  const onInputChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputValue(val);
      setQuantity(val === "" ? 0 : Number(val));
    }
  };

  const increment = () => {
    const val = inputValue === "" ? 0 : Number(inputValue) + 1;
    setInputValue(val.toString());
    setQuantity(val);
  };

  const decrement = () => {
    const val = inputValue === "" ? 0 : Math.max(Number(inputValue) - 1, 0);
    setInputValue(val.toString());
    setQuantity(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40" onClick={onClose} style={{ backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl max-w-md w-full p-6 border border-blue-100 shadow-xl">
        <div className="flex gap-4 mb-5">
          <div className="w-20 h-28 bg-gradient-to-tr from-blue-100/60 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <img src={book.cover_image_url
              ? book.cover_image_url.startsWith("http")
                ? book.cover_image_url
                : `http://127.0.0.1:8000/${book.cover_image_url}`
              : "https://via.placeholder.com/150x220?text=No+Cover"} alt={book.title} className="object-contain max-w-full max-h-full rounded shadow" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate" title={book.title}>{book.title}</h3>
            <p className="text-sm text-gray-600 truncate">by {book.author || "Unknown"}</p>
          </div>
        </div>

        <div className="mb-2 flex justify-between text-base"><span>Current Stock:</span><span>{book.quantity}</span></div>

        <div className="mb-6 flex justify-between items-center">
          <span>New Stock Quantity:</span>
          <div className="flex items-center gap-4">
            <button onClick={decrement} disabled={inputValue === "" || Number(inputValue) <= 0} className="w-9 h-9 rounded-full bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-lg font-bold">−</button>
            <input type="text" inputMode="numeric" pattern="[0-9]*" value={inputValue} onChange={onInputChange} className="w-16 text-center text-xl font-extrabold bg-gradient-to-tr from-blue-100 to-indigo-100 rounded px-2 py-1 outline-none" />
            <button onClick={increment} className="w-9 h-9 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 flex justify-center items-center text-lg font-bold">+</button>
          </div>
        </div>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <div className="flex gap-4">
          <button disabled={updating || inputValue === "" || Number(inputValue) === book.quantity} onClick={() => onUpdate(Number(inputValue))} className={`flex-1 py-3 rounded-xl text-white font-semibold text-lg shadow-lg ${updating ? "bg-blue-300 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-blue-700 hover:brightness-110"}`}>
            {updating ? "Updating..." : "Update Stock"}
          </button>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 font-semibold text-lg">Cancel</button>
        </div>
      </div>
    </div>
  );
};

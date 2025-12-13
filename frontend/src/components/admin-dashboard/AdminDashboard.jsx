import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
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
      const res = await axios.get(`${backendUrl}/dashboard-stats/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      toast.error("Failed to fetch dashboard stats");
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

  // Update stock quantity API call with toast notifications
  const onUpdateStock = async (newQty) => {
    if (!selectedLowStockBook || !selectedLowStockBook.id) {
      toast.error("Invalid book selected - missing ID");
      return;
    }
    if (quantityError) return;

    setUpdatingStock(true);
    try {
      await axios.patch(
        `${backendUrl}/books/${selectedLowStockBook.id}/update-stock/`,
        { quantity: newQty },
        {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        }
      );
      await fetchStats();

      setSelectedLowStockBook(null);
      setStockQuantity(0);
      setQuantityError("");
      toast.success("Stock updated successfully!");
    } catch (error) {
      setQuantityError("Failed to update stock.");
      console.error(error);
      toast.error("Failed to update stock");
    } finally {
      setUpdatingStock(false);
    }
  };

  return (
    <div className="h-[87vh] bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60 flex flex-col p-4 gap-8">
      <ToastContainer position="top-right" autoClose={3000} />

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
            onScroll={() => handleScroll(lowStockScrollRef, stats.lowStockAlerts.length, setLowStockLimit)}
          >
            {stats.lowStockAlerts.length === 0 && <p className="text-gray-500 italic">No alerts</p>}
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
                <span className="font-semibold truncate max-w-[70%]" title={book.title}>{book.title}</span>
                <span className="text-red-600 font-semibold">{book.quantity} left</span>
              </div>
            ))}
            {lowStockLimit < stats.lowStockAlerts.length && (
              <div className="text-xs text-blue-400 text-center mt-2 cursor-default">Scroll to load more...</div>
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

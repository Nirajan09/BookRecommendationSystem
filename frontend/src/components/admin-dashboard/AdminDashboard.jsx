import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalSalesToday: 0,
    totalSalesMonth: 0,
    numberOfOrders: 0,
    totalRevenue: 0,
    bestSellingBooks: [],
    lowStockAlerts: [],
  });

  useEffect(() => {
    // Example API call to get dashboard KPIs (replace with real API endpoint)
    axios
      .get(`${API_BASE_URL}/admin/dashboard-stats/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.error("Error loading dashboard stats", err);
      });
  }, []);

  return (
    <div className="min-h-[90vh] bg-gray-100 flex flex-col p-4">
      {/* Welcome Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome, {user?.username}! Here's a quick overview of the store.
        </p>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Sales Today" value={`$${stats.totalSalesToday}`} />
        <KpiCard label="Sales This Month" value={`$${stats.totalSalesMonth}`} />
        <KpiCard label="Orders" value={stats.numberOfOrders} />
        <KpiCard label="Total Revenue" value={`$${stats.totalRevenue}`} />
      </section>

      {/* Best-Selling Books & Low Stock */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Best-Selling Books</h2>
         {Array.isArray(stats.bestSellingBooks) && stats.bestSellingBooks.length > 0 ? (
  <ul>
              {stats.bestSellingBooks.map((book, idx) => (
                <li key={idx}>
                  {book.title} — {book.sold} sold
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Low Stock Alerts</h2>
          {Array.isArray(stats.lowStockAlerts) && stats.lowStockAlerts.length > 0 ? (
            <ul className="list-disc pl-5 text-red-600">
              {stats.lowStockAlerts.map((book, idx) => (
                <li key={idx}>
                  {book.title} — {book.stock} left
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No alerts</p>
          )}
        </div>
      </section>
      
      {/* Admin Navigation */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NavCard to="/admin/books" label="Book Management" />
        <NavCard to="/admin/orders" label="Order Management" />
        <NavCard to="/admin/customers" label="Customer Management" />
        <NavCard to="/admin/inventory" label="Inventory & Stock" />
        <NavCard to="/admin/promotions" label="Promotions & Discounts" />
        <NavCard to="/admin/reviews" label="Reviews & Ratings" />
        <NavCard to="/admin/reports" label="Reports & Analytics" />
        <NavCard to="/admin/settings" label="Admin Settings" />
        <NavCard to="/admin/notifications" label="Notifications" />
      </section>
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded shadow flex flex-col items-center">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-xl font-bold text-indigo-600">{value}</span>
    </div>
  );
}

function NavCard({ to, label }) {
  return (
    <Link
      to={to}
      className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium p-4 rounded shadow text-center flex items-center justify-center"
    >
      {label}
    </Link>
  );
}

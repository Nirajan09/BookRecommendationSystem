import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  // Example stats - replace with real data from API if available
  const exampleStats = {
    totalBooks: 128,
    totalOrders: 76,
    recentActivity: "Last order placed 3 mins ago"
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        {/* Quick Stats Section */}
        <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
            <span className="text-gray-500 text-sm">Total Books</span>
            <span className="text-2xl font-bold text-indigo-600">{exampleStats.totalBooks}</span>
          </div>
          <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
            <span className="text-gray-500 text-sm">Total Orders</span>
            <span className="text-2xl font-bold text-indigo-600">{exampleStats.totalOrders}</span>
          </div>
          <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
            <span className="text-gray-500 text-sm">Recent Activity</span>
            <span className="text-base text-gray-700">{exampleStats.recentActivity}</span>
          </div>
        </section>

        {/* Navigation Links */}
        <nav className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            to="/admin/books"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg flex-1 text-center shadow"
          >
            Manage Books
          </Link>
          {/* Future: Add more links here */}
        </nav>

        {/* Welcome Message */}
        <section className="w-full max-w-2xl bg-white rounded-lg p-6 shadow flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2 text-indigo-700">
            Welcome, {user && user.username}!
          </h2>
          <p className="text-gray-700 text-center">
            Here you can manage your store's books, review recent activity, and access all admin tools.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Today is {new Date().toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
          </p>
        </section>
      </main>
    </div>
  );
}

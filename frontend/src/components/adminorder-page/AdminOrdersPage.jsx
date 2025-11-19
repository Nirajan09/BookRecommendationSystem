import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-orange-100 text-orange-800",
  shipped: "bg-blue-100 text-blue-600",
  delivered: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-600",
};

const paymentLabels = {
  cash_on_delivery: "Cash On Delivery",
  stripe: "Credit/Debit Card (Stripe)",
  esewa: "E-Sewa",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [checked, setChecked] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [filter, statusFilter, paymentFilter, dateStart, dateEnd, page]);

  const loadOrders = () => {
    setLoading(true);
    const params = {
      search: filter,
      status: statusFilter,
      payment_method: paymentFilter,
      date_start: dateStart,
      date_end: dateEnd,
      page,
      page_size: pageSize,
    };

    axios
      .get(`${backendUrl}/orders/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        params,
      })
      .then((res) => {
        const results = res.data.results || res.data;
        setOrders(results);
        setChecked([]);
        if (res.data.count) {
          setTotalPages(Math.ceil(res.data.count / pageSize));
        } else {
          setTotalPages(1);
        }
      })
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  };

  const handleStatusChange = (orderId, newStatus) => {
    if (!newStatus) return;
    setLoading(true);

    axios
      .patch(
        `${backendUrl}/orders/${orderId}/`,
        { status: newStatus },
        { headers: { Authorization: `Token ${localStorage.getItem("token")}` } }
      )
      .then((res) => {
        const updatedOrder = res.data;
        setOrders((prev) =>
          prev.map((o) =>
            o.id === updatedOrder.id || o.reference === updatedOrder.reference ? updatedOrder : o
          )
        );
        setSelectedOrder(null);
        setStatusUpdate("");
      })
      .catch((err) => {
        console.error("Status update error:", err.response?.data || err.message);
        setError(err.response?.data?.detail || "Failed to update status");
      })
      .finally(() => setLoading(false));
  };

  const handleCheck = (id) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const handleCheckAll = () => setChecked(checked.length === orders.length ? [] : orders.map((o) => o.id));

  return (
    <div className="min-h-[90vh] bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60 p-6">
      <div className="flex justify-between items-center">
  <h1 className="text-2xl font-bold mb-6 text-blue-700">Order Management</h1>
  <Link
    to="/admin/"
    className="flex justify-center bg-gradient-to-r from-indigo-500 to-blue-600 hover:brightness-110 text-white px-4 py-2 rounded-lg shadow-md transition"
  >
    <span>Continue to Dashboard</span>
  </Link>
</div>


      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="">All Payments</option>
          <option value="cash_on_delivery">Cash On Delivery</option>
          <option value="esewa">E-Sewa</option>
          <option value="stripe">Stripe</option>
        </select>
        {/* You can add date filters here if needed, styled similarly */}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : error ? (
          <div className="text-red-600 p-8">{error}</div>
        ) : (
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="sticky top-0 bg-blue-50 z-10">
              <tr>
                <th className="p-2">
                  <input
                    type="checkbox"
                    checked={checked.length === orders.length && orders.length > 0}
                    onChange={handleCheckAll}
                    className="accent-blue-600"
                  />
                </th>
                <th className="p-2 text-left font-semibold text-gray-700">Order #</th>
                <th className="p-2 text-left font-semibold text-gray-700">Customer</th>
                <th className="p-2 text-left font-semibold text-gray-700">Date</th>
                <th className="p-2 text-left font-semibold text-gray-700">Amount</th>
                <th className="p-2 text-left font-semibold text-gray-700">Status</th>
                <th className="p-2 text-left font-semibold text-gray-700">Payment</th>
                <th className="p-2 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={idx % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-blue-50 hover:bg-blue-100"}
                  >
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={checked.includes(order.id)}
                        onChange={() => handleCheck(order.id)}
                        className="accent-blue-600"
                      />
                    </td>
                    <td className="p-2 font-mono text-gray-800">{order.reference}</td>
                    <td className="p-2 text-gray-700">{order.customer_name || order.email}</td>
                    <td className="p-2 text-gray-700">
                      {order.updated
                        ? new Date(order.updated).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Invalid Date"}
                    </td>
                    <td className="p-2 text-blue-600 font-semibold">Rs. {Number(order.total).toFixed(2)}</td>
                    <td className="p-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] ||
                          "bg-gray-100 text-gray-800"}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-2 text-gray-700">
                      {paymentLabels[order.payment_method] || order.payment_method?.replace("_", " ")}
                    </td>
                    <td className="p-2">
                      <button
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white px-4 py-1 rounded text-xs font-semibold shadow transition"
                        onClick={() => {
                          setSelectedOrder(order);
                          setStatusUpdate(order.status);
                        }}
                      >
                        Details & Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-400 italic">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex gap-2 mt-6 items-center justify-center text-gray-700">
        <button
          className="px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 disabled:opacity-50 transition"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 disabled:opacity-50 transition"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 bg-opacity-40 flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrder(null);
              setStatusUpdate("");
            }
          }}
        >
          <div
            className="bg-white rounded-3xl shadow-xl p-8 max-w-xl w-full overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              Order #{selectedOrder.reference || selectedOrder.id} Details
            </h2>
            <div className="mb-3 text-gray-700">
              <b>Customer:</b> {selectedOrder.customer_name || selectedOrder.email}
            </div>
            <div className="mb-3 text-gray-700">
              <b>Date:</b>{" "}
              {selectedOrder.updated
                ? new Date(selectedOrder.updated).toLocaleString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Invalid Date"}
            </div>
            <div className="mb-3 text-blue-700 font-semibold text-lg">
              <b>Amount:</b> Rs. {Number(selectedOrder.total).toFixed(2)}
            </div>
            <div className="mb-4">
              <b>Status:</b>{" "}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selectedOrder.status] ||
                  "bg-gray-100 text-gray-800"}`}
              >
                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
              </span>
            </div>

            {/* Status Update */}
            <div className="flex gap-3 items-center mb-6">
              <label htmlFor="order-status" className="text-gray-700 font-semibold">
                Update Status:
              </label>
              <select
                id="order-status"
                value={statusUpdate || selectedOrder.status}
                onChange={(e) => setStatusUpdate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white px-4 py-2 rounded font-semibold shadow transition"
                onClick={() => handleStatusChange(selectedOrder.id, statusUpdate)}
                disabled={loading}
              >
                Update
              </button>
            </div>

            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded font-semibold shadow transition"
              onClick={() => {
                setSelectedOrder(null);
                setStatusUpdate("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

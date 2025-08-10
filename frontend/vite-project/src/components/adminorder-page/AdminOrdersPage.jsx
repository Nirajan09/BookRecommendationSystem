import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";
// What status colors for badge
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-indigo-100 text-indigo-800",
};

// For payment display
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
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Load orders
  useEffect(() => {
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
      .get(`${API_BASE_URL}/orders/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        params,
      })
      .then((res) => {
        // When paginated, expect res.data.results and res.data.count
        const results = res.data.results || res.data;
        setOrders(results);
        setChecked([]);
        setTotalPages(res.data.count ? Math.ceil(res.data.count / pageSize) : 1);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders");
        setLoading(false);
      });
  }, [filter, statusFilter, paymentFilter, dateStart, dateEnd, page, pageSize]);

  // Update status
  const handleStatusChange = (orderId, newStatus) => {
    setLoading(true);
    axios
      .patch(
        `${API_BASE_URL}/orders/${orderId}/`,
        { status: newStatus },
        { headers: { Authorization: `Token ${localStorage.getItem("token")}` } }
      )
      .then(() => {
        setSelectedOrder(null);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        );
      })
      .catch(() => setError("Failed to update status"))
      .finally(() => setLoading(false));
  };

  // Bulk status change
  const bulkStatusChange = (newStatus) => {
    if (checked.length === 0) return;
    setLoading(true);
    Promise.all(
      checked.map((orderId) =>
        axios.patch(
          `${API_BASE_URL}/orders/${orderId}/`,
          { status: newStatus },
          { headers: { Authorization: `Token ${localStorage.getItem("token")}` } }
        )
      )
    )
      .then(() => {
        setOrders((prev) =>
          prev.map((o) =>
            checked.includes(o.id) ? { ...o, status: newStatus } : o
          )
        );
        setChecked([]);
      })
      .catch(() => setError("Bulk status update failed"))
      .finally(() => setLoading(false));
  };

  // Date filter helpers
  const handleDateChange = (type, val) => {
    if (type === "start") setDateStart(val);
    else setDateEnd(val);
    setPage(1);
  };

  // Checkbox helpers
  const handleCheck = (id) =>
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  const handleCheckAll = () =>
    setChecked(
      checked.length === orders.length ? [] : orders.map((o) => o.id)
    );

  // Render
  return (
    <div className="min-h-[90vh] bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">
        Order Management
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="text"
          placeholder="Search..."
          className="input input-bordered px-3 py-2 rounded border"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="input input-bordered px-3 py-2 rounded border"
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="input input-bordered px-3 py-2 rounded border"
          value={paymentFilter}
          onChange={e => {
            setPaymentFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Payments</option>
          <option value="stripe">Stripe</option>
          <option value="esewa">E-Sewa</option>
          <option value="cash_on_delivery">Cash On Delivery</option>
        </select>
        <input
          type="date"
          className="input input-bordered px-3 py-2 rounded border"
          value={dateStart}
          onChange={e => handleDateChange("start", e.target.value)}
        />
        <input
          type="date"
          className="input input-bordered px-3 py-2 rounded border"
          value={dateEnd}
          onChange={e => handleDateChange("end", e.target.value)}
        />
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-30"
          disabled={checked.length === 0 || loading}
          onClick={() => bulkStatusChange("shipped")}
        >
          Bulk Mark Shipped
        </button>
        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded disabled:opacity-30"
          disabled={checked.length === 0 || loading}
          onClick={() => bulkStatusChange("completed")}
        >
          Bulk Complete
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded disabled:opacity-30"
          disabled={checked.length === 0 || loading}
          onClick={() => bulkStatusChange("cancelled")}
        >
          Bulk Cancel
        </button>
        <span className="ml-4 text-gray-600 text-sm">
          {checked.length} selected
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">Loading orders...</div>
        ) : error ? (
          <div className="text-red-600 p-8">{error}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-200 z-10">
              <tr>
                <th className="p-2">
                  <input
                    type="checkbox"
                    checked={checked.length === orders.length && orders.length > 0}
                    onChange={handleCheckAll}
                  />
                </th>
                <th className="p-2">Order #</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Date</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Books</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Shipping</th>
                <th className="p-2">Status</th>
                <th className="p-2">Payment</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr
                  key={order.id}
                  className={
                    idx % 2 === 0
                      ? "bg-gray-50 hover:bg-blue-50"
                      : "bg-white hover:bg-blue-50"
                  }
                >
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={checked.includes(order.id)}
                      onChange={() => handleCheck(order.id)}
                    />
                  </td>
                  <td className="p-2 font-mono">{order.id}</td>
                  <td className="p-2">{order.customer_name || order.email}</td>
                  <td className="p-2">{order.created_at
                    ? new Date(order.created_at).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Invalid Date"}</td>
                  <td className="p-2">${Number(order.total).toFixed(2)}</td>
                  <td className="p-2">
                    {order.items
                      .map(
                        (item) =>
                          item.book_detail?.title
                            ? item.book_detail.title
                            : item.name
                      )
                      .join(", ")
                      .slice(0, 40) + (order.items.length > 2 ? "..." : "")}
                  </td>
                  <td className="p-2">
                    {order.items.reduce(
                      (sum, item) => sum + Number(item.quantity || 1),
                      0
                    )}
                  </td>
                  <td className="p-2 capitalize">{order.shipping_method}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${statusColors[order.status] || "bg-gray-100 text-gray-800"}
                      `}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.substring(1)}
                    </span>
                  </td>
                  <td className="p-2">
                    {paymentLabels[order.payment_method] ||
                      order.payment_method?.replace("_", " ")}
                  </td>
                  <td className="p-2">
                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-semibold"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Details & Manage
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center py-4 text-gray-400">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-4 items-center">
        <button
          className="px-3 py-1 rounded bg-gray-200"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-200"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-xl w-full overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-bold mb-4">
              Order #{selectedOrder.id} Details
            </h2>
            <div className="mb-2">
              <b>Customer:</b> {selectedOrder.customer_name || selectedOrder.email}
            </div>
            <div className="mb-2">
              <b>Date:</b>{" "}
              {selectedOrder.created_at
                ? new Date(selectedOrder.created_at).toLocaleString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Invalid Date"}
            </div>
            <div className="mb-2">
              <b>Amount:</b> ${Number(selectedOrder.total).toFixed(2)}
            </div>
            <div className="mb-2">
              <b>Status:</b>{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${statusColors[selectedOrder.status] || "bg-gray-100 text-gray-800"}`}
              >
                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.substring(1)}
              </span>
            </div>
            <div className="mb-2">
              <b>Payment:</b>{" "}
              {paymentLabels[selectedOrder.payment_method] ||
                selectedOrder.payment_method?.replace("_", " ")}
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mt-2 mb-1">Items</h3>
              <ul className="pl-4 list-disc">
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx}>
                    {item.book_detail?.title || item.name} — Qty: {item.quantity}, ${item.price}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <b>Address:</b> {selectedOrder.address}
            </div>
            <div className="mb-4">
              <b>Shipping Method:</b> {selectedOrder.shipping_method}
            </div>
            {/* Status Update */}
            <div className="flex gap-2 items-center mb-4">
              <label htmlFor="order-status" className="font-medium">
                Update Status:
              </label>
              <select
                id="order-status"
                value={statusUpdate || selectedOrder.status}
                onChange={(e) => setStatusUpdate(e.target.value)}
                className="input input-bordered px-3 py-2 rounded border"
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                className="bg-indigo-600 text-white px-3 py-2 rounded ml-2"
                onClick={() =>
                  handleStatusChange(
                    selectedOrder.id,
                    statusUpdate || selectedOrder.status
                  )
                }
                disabled={loading || statusUpdate === selectedOrder.status}
              >
                Update
              </button>
            </div>
            <button
              className="mt-2 bg-gray-500 text-white px-4 py-2 rounded"
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

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-orange-100 text-orange-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
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
      .get(`${API_BASE_URL}/orders/`, {
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
        `${API_BASE_URL}/orders/${orderId}/`,
        { status: newStatus },
        { headers: { Authorization: `Token ${localStorage.getItem("token")}` } }
      )
      .then((res) => {
        const updatedOrder = res.data;
        setOrders((prev) =>
          prev.map((o) =>
            o.id === updatedOrder.id || o.reference === updatedOrder.reference
              ? updatedOrder
              : o
          )
        );
        setSelectedOrder(null); // close modal
        setStatusUpdate("");
      })
      .catch((err) => {
        console.error("Status update error:", err.response?.data || err.message);
        setError("Failed to update status");
      })
      .finally(() => setLoading(false));
  };

  const handleCheck = (id) =>
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const handleCheckAll = () =>
    setChecked(
      checked.length === orders.length ? [] : orders.map((o) => o.id)
    );

  return (
    <div className="min-h-[90vh] bg-gray-100 p-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6 text-indigo-700">
          Order Management
        </h1>
        <Link
          to="/admin/"
          className="flex justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
        >
          <span>Continue to Dashboard</span>
          
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select
          className="input input-bordered px-3 py-2 rounded border"
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
          className="border p-2 rounded"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="">All Payments</option>
          <option value="cash_on_delivery">Cash On Delivery</option>
          <option value="esewa">E-Sewa</option>
          <option value="stripe">Stripe</option>
        </select>
        <input
          type="date"
          className="input input-bordered px-3 py-2 rounded border"
          value={dateStart}
          onChange={(e) => {
            setDateStart(e.target.value);
            setPage(1);
          }}
        />
        <input
          type="date"
          className="input input-bordered px-3 py-2 rounded border"
          value={dateEnd}
          onChange={(e) => {
            setDateEnd(e.target.value);
            setPage(1);
          }}
        />
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
                    checked={
                      checked.length === orders.length && orders.length > 0
                    }
                    onChange={handleCheckAll}
                  />
                </th>
                <th className="p-2">Order #</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Date</th>
                <th className="p-2">Amount</th>
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
                  <td className="p-2 font-mono">{order.reference}</td>
                  <td className="p-2">{order.customer_name || order.email}</td>
                  <td className="p-2">
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
                  <td className="p-2">${Number(order.total).toFixed(2)}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] ||
                        "bg-gray-100 text-gray-800"
                        }`}
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
                      onClick={() => {
                        setSelectedOrder(order);
                        setStatusUpdate(order.status);
                      }}
                    >
                      Details & Manage
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-400">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination controls */}
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
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrder(null);
              setStatusUpdate("");
            }
          }}
        >
          <div
            className="bg-white rounded shadow-lg p-6 max-w-xl w-full overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">
              Order #{selectedOrder.reference || selectedOrder.id} Details
            </h2>
            <div className="mb-2">
              <b>Customer:</b> {selectedOrder.customer_name || selectedOrder.email}
            </div>
            <div className="mb-2">
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
            <div className="mb-2">
              <b>Amount:</b> ${Number(selectedOrder.total).toFixed(2)}
            </div>
            <div className="mb-2">
              <b>Status:</b>{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[selectedOrder.status] ||
                  "bg-gray-100 text-gray-800"
                  }`}
              >
                {selectedOrder.status.charAt(0).toUpperCase() +
                  selectedOrder.status.substring(1)}
              </span>
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
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                className="bg-indigo-600 text-white px-3 py-2 rounded ml-2"
                onClick={() =>
                  handleStatusChange(selectedOrder.id, statusUpdate)
                }
                disabled={loading}
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

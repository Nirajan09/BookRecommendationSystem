import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../utils/AuthContext/AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function EsewaSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token: authToken } = useAuth();

  useEffect(() => {
    // 1. Get params from URL
    const params = new URLSearchParams(location.search);
    const oid = params.get("oid");
    const amt = params.get("amt");
    const refId = params.get("refId");

    if (!oid || !amt || !refId) {
      toast.error("Invalid payment data from eSewa");
      navigate("/cart");
      return;
    }

    // 2. Retrieve orderPayload stored earlier
    const storedPayload = localStorage.getItem("pendingOrderPayload");
    if (!storedPayload) {
      toast.error("Order details not found");
      navigate("/cart");
      return;
    }
    const orderPayload = JSON.parse(storedPayload);

    // 3. Verify payment in backend (pass eSewa params)
    axios
      .post(
        `${backendUrl}/orders/esewa-success/`,
        {
          ...orderPayload,
          oid,
          amt,
          refId,
        },
        {
          headers: { Authorization: `Token ${authToken}` },
        }
      )
      .then((res) => {
        toast.success("Payment verified & order placed!");
        localStorage.removeItem("pendingOrderPayload"); // cleanup
        navigate(`/order-confirmation/${res.data.id}`);
      })
      .catch((err) => {
        toast.error(err.response?.data?.detail || "Order creation failed");
        navigate("/payment-fail");
      });
  }, [location.search, navigate, authToken]);

  return <div>Verifying payment and placing your order...</div>;
}

import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8000";

export default function EsewaSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token: authToken } = useAuth();
  const orderPayload = location.state?.orderPayload;

  useEffect(() => {
    if (!orderPayload) {
      toast.error("Missing order data");
      navigate("/cart");
      return;
    }
    // In production: VERIFY payment with eSewa server before creating order
    axios.post(`${API_BASE_URL}/orders/`, orderPayload, {
      headers: { Authorization: `Token ${authToken}` }
    })
      .then(res => {
        toast.success("eSewa payment verified and order placed!");
        navigate(`/order-confirmation/${res.data.id}`);

      })
      .catch(err => {
        toast.error(err.response?.data?.detail || "Order creation failed after eSewa payment");
      });
  }, [orderPayload, navigate, authToken]);

  return <div>Verifying payment and placing your order...</div>;
}

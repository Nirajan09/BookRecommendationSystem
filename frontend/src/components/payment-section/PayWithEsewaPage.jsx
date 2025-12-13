import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PayWithEsewaPage() {
  const location = useLocation();
  const { orderPayload, totalCost } = location.state || {};

  useEffect(() => {
    if (orderPayload) {
      // Store order payload in localStorage for retrieval after redirect
      localStorage.setItem("pendingOrderPayload", JSON.stringify(orderPayload));

      const successUrl = `http://localhost:5173/esewa-success`;
      const failUrl = `http://localhost:5173/payment-fail`;

      const paymentUrl = `https://rc.esewa.com.np/epay/main?amt=${totalCost}&txAmt=0&psc=0&pdc=0&tAmt=${totalCost}&pid=TEMP123&scd=EPAYTEST&su=${encodeURIComponent(
        successUrl
      )}&fu=${encodeURIComponent(failUrl)}`;
      window.location.href = paymentUrl;
    }
  }, [orderPayload, totalCost]);

  return <div>Redirecting to eSewa...</div>;
}

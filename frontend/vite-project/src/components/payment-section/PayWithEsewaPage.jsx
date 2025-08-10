import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PayWithEsewaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderPayload, totalCost } = location.state || {};

  useEffect(() => {
    if (orderPayload) {
      // Build eSewa URL (point to your success route in SPA)
      const successUrl = `http://localhost:3000/esewa-success`;
      const failUrl = `http://localhost:3000/esewa-fail`;

      const paymentUrl = `https://rc.esewa.com.np/epay/main?amt=${totalCost}&txAmt=0&psc=0&pdc=0&tAmt=${totalCost}&pid=TEMP123&scd=EPAYTEST&su=${encodeURIComponent(successUrl)}&fu=${encodeURIComponent(failUrl)}`;
      window.location.href = paymentUrl;
    }
  }, [orderPayload, totalCost]);

  return <div>Redirecting to eSewa...</div>;
}

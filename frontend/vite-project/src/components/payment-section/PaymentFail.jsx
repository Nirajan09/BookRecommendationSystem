import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentFail() {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <h1>❌ Payment Failed</h1>
      <p>Your eSewa payment could not be completed.</p>
      <button onClick={() => navigate("/checkout")}>Back to Checkout</button>
    </div>
  );
}

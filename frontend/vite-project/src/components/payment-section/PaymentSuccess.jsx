import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8000";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const amt = searchParams.get("amt");
    const pid = searchParams.get("pid");
    const refId = searchParams.get("refId");

    const verifyPayment = async () => {
      try {
        const resp = await axios.post(`${API_BASE_URL}/orders/esewa/verify/`, { amt, pid, refId });
        toast.success("Payment verified successfully!");
        setVerified(true);
      } catch (err) {
        toast.error("Payment verification failed.");
        console.error(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (amt && pid) verifyPayment();
    else {
      toast.error("Missing payment details.");
      navigate("/");
    }
  }, [searchParams, navigate]);

  if (loading) return <p>Verifying payment...</p>;

  return (
    <div className="p-6">
      {verified ? (
        <>
          <h1>✅ Payment Successful</h1>
          <p>Your order has been confirmed.</p>
        </>
      ) : (
        <>
          <h1>❌ Payment Failed</h1>
          <p>Please try again.</p>
        </>
      )}
    </div>
  );
}

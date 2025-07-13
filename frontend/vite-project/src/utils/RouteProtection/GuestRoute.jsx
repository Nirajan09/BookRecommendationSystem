// src/components/GuestRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";

export default function GuestRoute({ children }) {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

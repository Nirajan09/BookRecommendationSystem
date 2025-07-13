// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();

  // If not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  // If authenticated, render the protected content
  return children;
}

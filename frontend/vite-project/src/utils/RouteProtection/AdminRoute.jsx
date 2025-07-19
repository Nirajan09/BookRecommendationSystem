import { useAuth } from "../AuthContext/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { token, user } = useAuth();
  // Only allow if user is authenticated AND is_staff
  if (!token || !user || !user.is_staff) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

import { useAuth } from "../AuthContext/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { token, user } = useAuth();
  if (!token || !user?.isAdmin) return <Navigate to="/login" replace />;
  return children;
}

import { useAuth } from "../../utils/AuthContext/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user === null) return <div>Loading...</div>; // Wait for user to load

  if (!user.is_staff) return <Navigate to="/user-home" replace />;
  return children;
}

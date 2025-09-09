import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext/AuthContext";

export default function GuestRoute({ children }) {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      if (user.is_staff) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/books", { replace: true });
      }
    }
  }, [token, user, navigate]);

  if (token && user) return null;

  return children;
}

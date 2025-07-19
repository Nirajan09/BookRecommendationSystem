// src/utils/AuthContext/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // login returns profile for reliable navigation
  const login = async (tokenValue) => {
    setToken(tokenValue);
    localStorage.setItem("token", tokenValue);

    const res = await axios.get("http://localhost:8000/accounts/user/", {
      headers: { Authorization: `Token ${tokenValue}` },
    });
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
    return res.data; // RETURN user info for immediate role-based redirect
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

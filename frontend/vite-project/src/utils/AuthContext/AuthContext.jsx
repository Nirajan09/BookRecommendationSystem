// utils/AuthContext/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

const login = async (tokenValue) => {
  setToken(tokenValue);
  localStorage.setItem('token', tokenValue);

  // Fetch user info immediately after login
  const res = await axios.get('http://localhost:8000/accounts/user/', {
    headers: { Authorization: `Token ${tokenValue}` },
  });
  setUser(res.data);
  localStorage.setItem('user', JSON.stringify(res.data));
};


  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ token, setToken, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

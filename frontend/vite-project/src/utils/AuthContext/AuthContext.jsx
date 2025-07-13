import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Store token in state
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Login sets the token 
  const login = (tokenValue) => {
    setToken(tokenValue);
    localStorage.setItem('token', tokenValue);
  };

  // Logout clears the token
  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext/AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const BASE_URL = "http://localhost:8000";

  const fetchCartCount = async () => {
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const res = await axios.get(`${BASE_URL}/books/cart/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const totalItems = res.data.reduce(
        (acc, item) => acc + (item.quantity || 1),
        0
      );
      setCartCount(totalItems);
    } catch (err) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [token]);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const refresh = useCallback(() => {
    if (!user) {
      setItems([]);
      setTotal(0);
      return Promise.resolve();
    }
    setLoading(true);
    return api
      .getCart()
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast((t) => (t === message ? null : t)), 3000);
  }

  async function addItem(product, quantity = 1) {
    await api.addToCart(product.id, quantity);
    await refresh();
    showToast(`${product.name} added to cart`);
  }

  async function updateItem(id, quantity) {
    await api.updateCartItem(id, quantity);
    await refresh();
  }

  async function removeItem(id) {
    await api.removeCartItem(id);
    await refresh();
  }

  async function clear() {
    await api.clearCart();
    await refresh();
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, total, count, loading, addItem, updateItem, removeItem, clear, refresh }}
    >
      {children}
      {toast && (
        <div className="toast">
          {toast} · <Link to="/cart">View cart</Link>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

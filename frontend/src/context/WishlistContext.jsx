import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!user) {
      setItems([]);
      return Promise.resolve();
    }
    setLoading(true);
    return api
      .getWishlist()
      .then((data) => setItems(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function isSaved(productId) {
    return items.some((item) => item.product_id === productId);
  }

  async function toggle(product) {
    const existing = items.find((item) => item.product_id === product.id);
    if (existing) {
      await api.removeWishlistItem(existing.id);
    } else {
      await api.addToWishlist(product.id);
    }
    await refresh();
  }

  async function remove(itemId) {
    await api.removeWishlistItem(itemId);
    await refresh();
  }

  return (
    <WishlistContext.Provider
      value={{ items, count: items.length, loading, isSaved, toggle, remove, refresh }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import './wishlist-button.css';

export default function WishlistButton({ product, className = '' }) {
  const { user } = useAuth();
  const { isSaved, toggle } = useWishlist();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const saved = isSaved(product.id);

  async function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setBusy(true);
    try {
      await toggle(product);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={`wishlist-btn ${saved ? 'is-saved' : ''} ${className}`}
      onClick={handleClick}
      disabled={busy}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={saved}
      title={saved ? 'Saved to wishlist' : 'Save to wishlist'}
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}

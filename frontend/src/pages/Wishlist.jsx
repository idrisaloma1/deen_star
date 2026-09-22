import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import './wishlist.css';

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function WishlistRow({ item, onRemove }) {
  const { addItem } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  async function handleMoveToCart() {
    setBusy(true);
    setError('');
    try {
      await addItem({ id: item.product_id, name: item.name }, 1);
      setAdded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    try {
      await onRemove(item.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wishlist-row">
      <Link to={`/product/${item.slug}`} className="wishlist-row-media">
        {item.image_url ? <img src={item.image_url} alt={item.name} /> : <span>{item.name.charAt(0)}</span>}
      </Link>

      <div className="wishlist-row-info">
        <Link to={`/product/${item.slug}`} className="wishlist-row-name">
          {item.name}
        </Link>
        <span className="wishlist-row-price">{formatNaira(item.price)}</span>
        {error && <span className="wishlist-row-error">{error}</span>}
      </div>

      <div className="wishlist-row-actions">
        <button className="btn btn-sm btn-amber" onClick={handleMoveToCart} disabled={busy || added}>
          {added ? 'Added ✓' : busy ? 'Adding…' : 'Add to cart'}
        </button>
        <button className="cart-row-remove" onClick={handleRemove} disabled={busy}>
          Remove
        </button>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const { items, loading, remove } = useWishlist();

  return (
    <div className="container wishlist-page">
      <h1>Your wishlist</h1>

      {loading && items.length === 0 ? (
        <p className="state-msg">Loading your wishlist…</p>
      ) : items.length === 0 ? (
        <div className="cart-empty">
          <p>Nothing saved yet — tap the heart on any product to keep it here.</p>
          <Link to="/" className="btn btn-primary">
            Browse the mall
          </Link>
        </div>
      ) : (
        <div className="wishlist-list">
          {items.map((item) => (
            <WishlistRow key={item.id} item={item} onRemove={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

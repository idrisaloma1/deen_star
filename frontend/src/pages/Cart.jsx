import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import './cart.css';

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function CartRow({ item, onUpdate, onRemove }) {
  const [busy, setBusy] = useState(false);
  const lineTotal = Number(item.price) * item.quantity;
  const atStockLimit = item.quantity >= item.stock_quantity;

  async function changeQty(next) {
    if (next < 1 || next > item.stock_quantity) return;
    setBusy(true);
    try {
      await onUpdate(item.id, next);
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
    <div className="cart-row">
      <Link to={`/product/${item.slug}`} className="cart-row-media">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} />
        ) : (
          <span>{item.name.charAt(0)}</span>
        )}
      </Link>

      <div className="cart-row-info">
        <Link to={`/product/${item.slug}`} className="cart-row-name">
          {item.name}
        </Link>
        <span className="cart-row-price">{formatNaira(item.price)} each</span>
        {atStockLimit && <span className="cart-row-limit">Max stock reached ({item.stock_quantity})</span>}
      </div>

      <div className="qty-stepper">
        <button onClick={() => changeQty(item.quantity - 1)} disabled={busy || item.quantity <= 1}>
          −
        </button>
        <span>{item.quantity}</span>
        <button onClick={() => changeQty(item.quantity + 1)} disabled={busy || atStockLimit}>
          +
        </button>
      </div>

      <div className="cart-row-total">{formatNaira(lineTotal)}</div>

      <button className="cart-row-remove" onClick={handleRemove} disabled={busy} aria-label="Remove item">
        Remove
      </button>
    </div>
  );
}

export default function Cart() {
  const { items, total, loading, updateItem, removeItem, clear } = useCart();
  const [error, setError] = useState('');

  async function handleUpdate(id, quantity) {
    setError('');
    try {
      await updateItem(id, quantity);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(id) {
    setError('');
    try {
      await removeItem(id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleClear() {
    if (!confirm('Clear your whole cart?')) return;
    setError('');
    try {
      await clear();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container cart-page">
      <h1>Your cart</h1>

      {error && <div className="error-banner">{error}</div>}

      {loading && items.length === 0 ? (
        <p className="state-msg">Loading your cart…</p>
      ) : items.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary">
            Browse the mall
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            <div className="cart-items-head">
              <span>{items.length} item{items.length === 1 ? '' : 's'} in your cart</span>
              <button className="cart-clear" onClick={handleClear}>
                Clear cart
              </button>
            </div>
            {items.map((item) => (
              <CartRow key={item.id} item={item} onUpdate={handleUpdate} onRemove={handleRemove} />
            ))}
          </div>

          <aside className="cart-summary">
            <h2>Order summary</h2>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{formatNaira(total)}</span>
            </div>
            <p className="cart-summary-note">Delivery fees are arranged with the rider.</p>
            <Link to="/checkout" className="btn btn-amber btn-block">
              Checkout
            </Link>
            <Link to="/" className="cart-summary-continue">
              ← Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

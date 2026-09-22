import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import './checkout.css';

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export default function Checkout() {
  const { items, total, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ shipping_address: '', shipping_phone: '', notes: '' });
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const data = await api.placeOrder(form);
      await refresh();
      navigate(`/orders/${data.order.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="container checkout-page">
      <Link to="/cart" className="back-link">
        ← Back to cart
      </Link>
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Delivery details</h2>
          {error && <div className="error-banner">{error}</div>}

          <div className="field">
            <label htmlFor="shipping_address">Delivery address</label>
            <textarea
              id="shipping_address"
              name="shipping_address"
              rows={3}
              placeholder="Street, area, city — as detailed as possible"
              value={form.shipping_address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="shipping_phone">Phone number</label>
            <input
              id="shipping_phone"
              name="shipping_phone"
              type="tel"
              placeholder="For the delivery rider to reach you"
              value={form.shipping_phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Landmark, preferred delivery time, etc."
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          <div className="checkout-payment-note">
            Payment is arranged on delivery — pay the rider by cash or transfer when your order
            arrives.
          </div>

          <button className="btn btn-amber btn-block" type="submit" disabled={placing}>
            {placing ? 'Placing order…' : `Place order — ${formatNaira(total)}`}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          {items.map((item) => (
            <div key={item.id} className="checkout-summary-row">
              <span>
                {item.name} <span className="checkout-summary-qty">× {item.quantity}</span>
              </span>
              <span>{formatNaira(Number(item.price) * item.quantity)}</span>
            </div>
          ))}
          <div className="checkout-summary-total">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

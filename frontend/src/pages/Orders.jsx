import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import './orders.css';

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{status}</span>;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listMyOrders()
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container orders-page">
      <h1>Your orders</h1>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p className="state-msg">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <div className="cart-empty">
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="btn btn-primary">
            Browse the mall
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="order-row">
              <div className="order-row-main">
                <span className="order-row-id">Order #{order.id.slice(0, 8)}</span>
                <span className="order-row-date">{formatDate(order.created_at)}</span>
              </div>
              <StatusBadge status={order.status} />
              <span className="order-row-total">{formatNaira(order.total_amount)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

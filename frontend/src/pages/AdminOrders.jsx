import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatusBadge } from './Orders.jsx';
import './admin.css';

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api
      .listAllOrders()
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleOrders = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <div className="container admin-page">
      <h1>Orders</h1>
      <p className="auth-sub">{orders.length} order{orders.length === 1 ? '' : 's'} total.</p>

      {error && <div className="error-banner">{error}</div>}

      <div className="admin-orders-filter">
        {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button
            key={s || 'all'}
            className={`category-pill ${filter === s ? 'is-active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="state-msg">Loading orders…</p>
      ) : visibleOrders.length === 0 ? (
        <p className="state-msg">No orders here yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id.slice(0, 8)}</td>
                <td>
                  {o.full_name}
                  <br />
                  <span className="admin-orders-email">{o.email}</span>
                </td>
                <td>{formatDate(o.created_at)}</td>
                <td>{formatNaira(o.total_amount)}</td>
                <td>
                  <StatusBadge status={o.status} />
                </td>
                <td>
                  <Link to={`/orders/${o.id}`} className="btn btn-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge } from './Orders.jsx';
import './order-detail.css';

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  function load() {
    setLoading(true);
    api
      .getOrder(id)
      .then((data) => {
        setOrder(data.order);
        setItems(data.items);
        setHistory(data.history);
        setNewStatus(data.order.status);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusUpdate(e) {
    e.preventDefault();
    setUpdating(true);
    setError('');
    try {
      await api.updateOrderStatus(id, { status: newStatus, note: statusNote || undefined });
      setStatusNote('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="container state-msg">Loading order…</div>;
  if (error && !order)
    return (
      <div className="container">
        <div className="error-banner">{error}</div>
        <Link to="/orders" className="btn btn-sm">
          ← Back to orders
        </Link>
      </div>
    );
  if (!order) return null;

  return (
    <div className="container order-detail-page">
      <Link to={user?.role === 'admin' ? '/admin/orders' : '/orders'} className="back-link">
        ← Back to orders
      </Link>

      {justPlaced && (
        <div className="success-banner">
          Order placed! We'll update the status here as it moves through delivery.
        </div>
      )}
      {error && <div className="error-banner">{error}</div>}

      <div className="order-detail-head">
        <div>
          <h1>Order #{order.id.slice(0, 8)}</h1>
          <span className="order-detail-date">Placed {formatDateTime(order.created_at)}</span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="order-detail-layout">
        <div>
          <div className="order-detail-card">
            <h2>Items</h2>
            {items.map((item) => (
              <div key={item.id} className="order-detail-item">
                <span className="order-detail-item-name">
                  {item.product_name} <span className="order-detail-item-qty">× {item.quantity}</span>
                </span>
                <span>{formatNaira(item.subtotal)}</span>
              </div>
            ))}
            <div className="order-detail-total">
              <span>Total</span>
              <span>{formatNaira(order.total_amount)}</span>
            </div>
          </div>

          <div className="order-detail-card">
            <h2>Delivery</h2>
            <p className="order-detail-line">{order.shipping_address}</p>
            <p className="order-detail-line">{order.shipping_phone}</p>
            {order.notes && <p className="order-detail-line order-detail-notes">Note: {order.notes}</p>}
          </div>

          {user?.role === 'admin' && (
            <div className="order-detail-card">
              <h2>Update status</h2>
              <form className="order-status-form" onSubmit={handleStatusUpdate}>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Note (optional)"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
                <button className="btn btn-sm btn-primary" type="submit" disabled={updating}>
                  {updating ? 'Updating…' : 'Update'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="order-detail-card order-timeline">
          <h2>Timeline</h2>
          {history.map((h, i) => (
            <div key={h.id} className={`timeline-entry ${i === history.length - 1 ? 'is-latest' : ''}`}>
              <div className="timeline-dot" />
              <div>
                <div className="timeline-status">
                  <StatusBadge status={h.status} />
                </div>
                {h.note && <div className="timeline-note">{h.note}</div>}
                <div className="timeline-date">{formatDateTime(h.changed_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import WishlistButton from '../components/WishlistButton.jsx';
import './product-detail.css';

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setQty(1);
    api
      .getProduct(slug)
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container state-msg">Loading…</div>;
  if (error)
    return (
      <div className="container">
        <div className="error-banner">{error}</div>
        <Link to="/" className="btn btn-sm">
          ← Back to the mall
        </Link>
      </div>
    );
  if (!product) return null;

  const outOfStock = product.stock_quantity <= 0;

  async function handleAddToCart() {
    if (!user) {
      navigate('/login');
      return;
    }
    setAddError('');
    setAdding(true);
    try {
      await addItem(product, qty);
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="container product-detail">
      <Link to="/" className="back-link">
        ← Back to the mall
      </Link>

      <div className="product-detail-grid">
        <div className="product-detail-media">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <span className="product-detail-initial">{product.name.charAt(0)}</span>
          )}
        </div>

        <div className="product-detail-info">
          {product.category_name && (
            <span className="stall-card-category">{product.category_name}</span>
          )}
          <div className="product-detail-title-row">
            <h1>{product.name}</h1>
            <WishlistButton product={product} />
          </div>
          <div className="product-detail-price">{formatNaira(product.price)}</div>

          <div className="product-detail-meta">
            {product.review_count > 0 ? (
              <span>
                ★ {Number(product.avg_rating).toFixed(1)} · {product.review_count} review
                {product.review_count === 1 ? '' : 's'}
              </span>
            ) : (
              <span>No reviews yet</span>
            )}
          </div>

          {product.description && <p className="product-detail-desc">{product.description}</p>}

          <div className="product-detail-stock">
            {outOfStock ? (
              <span className="stall-card-oos">Out of stock</span>
            ) : (
              <span>{product.stock_quantity} in stock</span>
            )}
          </div>

          {addError && <div className="error-banner">{addError}</div>}

          {!outOfStock && (
            <div className="product-detail-qty">
              <span className="product-detail-qty-label">Quantity</span>
              <div className="qty-stepper">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>
                  −
                </button>
                <span>{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}
                  disabled={qty >= product.stock_quantity}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            className="btn btn-amber btn-block"
            disabled={outOfStock || adding}
            onClick={handleAddToCart}
          >
            {outOfStock ? 'Unavailable' : adding ? 'Adding…' : `Add ${qty > 1 ? `${qty} ` : ''}to cart`}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import './product-detail.css';

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
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
          <h1>{product.name}</h1>
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

          <button className="btn btn-amber" disabled={outOfStock}>
            {outOfStock ? 'Unavailable' : 'Add to cart'}
          </button>
          <p className="product-detail-note">
            Cart and checkout are coming soon — this button is a placeholder for now.
          </p>
        </div>
      </div>
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import WishlistButton from './WishlistButton.jsx';
import './product-card.css';

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const outOfStock = product.stock_quantity <= 0;

  async function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addItem(product, 1);
    } catch {
      // toast/context already surfaces failures elsewhere; keep card quiet
    } finally {
      setAdding(false);
    }
  }

  return (
    <Link to={`/product/${product.slug}`} className="stall-card">
      <div className="stall-card-media">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <span className="stall-card-initial">{product.name.charAt(0)}</span>
        )}
        <span className="stall-card-tag">{formatNaira(product.price)}</span>
        <WishlistButton product={product} className="card-float" />
      </div>
      <div className="stall-card-body">
        {product.category_name && (
          <span className="stall-card-category">{product.category_name}</span>
        )}
        <h3 className="stall-card-name">{product.name}</h3>
        <div className="stall-card-meta">
          {product.review_count > 0 ? (
            <span>
              ★ {Number(product.avg_rating).toFixed(1)} ({product.review_count})
            </span>
          ) : (
            <span>No reviews yet</span>
          )}
          {outOfStock && <span className="stall-card-oos">Out of stock</span>}
        </div>
        <button
          className="btn btn-sm btn-amber stall-card-add"
          onClick={handleAddToCart}
          disabled={outOfStock || adding}
        >
          {outOfStock ? 'Unavailable' : adding ? 'Adding…' : 'Add to cart'}
        </button>
      </div>
    </Link>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import CategoryRail from '../components/CategoryRail.jsx';
import ProductCard from '../components/ProductCard.jsx';
import './home.css';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listCategories().then((data) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .listProducts({ search, category, sort, page, limit: 12 })
      .then((data) => {
        setProducts(data.products);
        setPagination(data.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>
            Everything the mall has,
            <br />
            minus the queue.
          </h1>
          <p className="hero-sub">
            Groceries, gadgets, fashion, and home essentials — one stall at a time,
            delivered across Lagos.
          </p>
        </div>
      </section>

      <div className="container">
        <CategoryRail categories={categories} active={category} onSelect={(c) => updateParam('category', c)} />

        <div className="listing-toolbar">
          <span className="listing-count">
            {pagination ? `${pagination.total} product${pagination.total === 1 ? '' : 's'}` : ''}
            {search && ` for "${search}"`}
          </span>
          <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p className="state-msg">Loading the mall…</p>
        ) : products.length === 0 ? (
          <p className="state-msg">No products match here yet. Try a different stall or search.</p>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="pager">
            <button
              className="btn btn-sm"
              disabled={page <= 1}
              onClick={() => updateParam('page', String(page - 1))}
            >
              ← Prev
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-sm"
              disabled={page >= pagination.totalPages}
              onClick={() => updateParam('page', String(page + 1))}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

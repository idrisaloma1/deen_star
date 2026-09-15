import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import './admin.css';

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

const EMPTY_FORM = { name: '', description: '', price: '', stock_quantity: '', category_id: '' };

export default function Admin() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function loadProducts() {
    api.listProducts({ limit: 50, sort: 'newest' }).then((data) => setProducts(data.products));
  }

  useEffect(() => {
    api.listCategories().then((data) => setCategories(data.categories));
    loadProducts();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.createProduct({
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        stock_quantity: form.stock_quantity ? Number(form.stock_quantity) : 0,
        category_id: form.category_id || undefined
      });
      setSuccess(`"${form.name}" added.`);
      setForm(EMPTY_FORM);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    try {
      await api.deleteProduct(product.id);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container admin-page">
      <h1>Stall management</h1>
      <p className="auth-sub">Add new products or remove existing ones.</p>

      <div className="admin-grid">
        <form className="admin-form" onSubmit={handleSubmit}>
          <h2>Add a product</h2>
          {error && <div className="error-banner">{error}</div>}
          {success && <div className="success-banner">{success}</div>}

          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="price">Price (₦)</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="stock_quantity">Stock</label>
              <input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="category_id">Category</label>
            <select id="category_id" name="category_id" value={form.category_id} onChange={handleChange}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add product'}
          </button>
        </form>

        <div className="admin-list">
          <h2>Current products ({products.length})</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category_name || '—'}</td>
                  <td>{formatNaira(p.price)}</td>
                  <td>{p.stock_quantity}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

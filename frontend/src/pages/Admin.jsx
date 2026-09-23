import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import './admin.css';

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

const EMPTY_FORM = { name: '', description: '', price: '', stock_quantity: '', category_id: '' };

function CategoryRow({ category, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || name.trim() === category.name) {
      setEditing(false);
      setName(category.name);
      return;
    }
    setSaving(true);
    try {
      await onRename(category.id, name.trim());
      setEditing(false);
    } catch {
      setName(category.name);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="category-row">
      {editing ? (
        <input
          className="category-row-input"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setName(category.name);
              setEditing(false);
            }
          }}
        />
      ) : (
        <span className="category-row-name">{category.name}</span>
      )}

      <div className="category-row-actions">
        {editing ? (
          <>
            <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              className="btn btn-sm"
              onClick={() => {
                setName(category.name);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-sm" onClick={() => setEditing(true)}>
              Rename
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(category)}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ProductRow({ product, categories, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    price: product.price,
    stock_quantity: product.stock_quantity,
    category_id: product.category_id || ''
  });
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setForm({
      name: product.name,
      price: product.price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id || ''
    });
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(product.id, {
        name: form.name,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
        category_id: form.category_id || null
      });
      setEditing(false);
    } catch {
      // error already surfaced by parent
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <tr>
        <td>
          <input
            className="admin-table-input"
            value={form.name}
            autoFocus
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </td>
        <td>
          <select
            className="admin-table-input"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </td>
        <td>
          <input
            className="admin-table-input admin-table-input-num"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </td>
        <td>
          <input
            className="admin-table-input admin-table-input-num"
            type="number"
            min="0"
            value={form.stock_quantity}
            onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
          />
        </td>
        <td className="admin-table-actions">
          <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="btn btn-sm" onClick={() => setEditing(false)} disabled={saving}>
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.category_name || '—'}</td>
      <td>{formatNaira(product.price)}</td>
      <td>{product.stock_quantity}</td>
      <td className="admin-table-actions">
        <button className="btn btn-sm" onClick={startEdit}>
          Edit
        </button>
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(product)}>
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function Admin() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  function loadProducts() {
    api.listProducts({ limit: 50, sort: 'newest' }).then((data) => setProducts(data.products));
  }

  function loadCategories() {
    return api.listCategories().then((data) => setCategories(data.categories));
  }

  useEffect(() => {
    loadCategories();
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

  async function handleUpdateProduct(id, payload) {
    setError('');
    try {
      await api.updateProduct(id, payload);
      loadProducts();
    } catch (err) {
      setError(err.message);
      throw err;
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

  async function handleRenameCategory(id, name) {
    setCategoryError('');
    try {
      await api.updateCategory(id, { name });
      await loadCategories();
      loadProducts(); // category_name on products changes too
    } catch (err) {
      setCategoryError(err.message);
      throw err;
    }
  }

  async function handleDeleteCategory(category) {
    if (
      !confirm(
        `Delete "${category.name}"? Products in this category will become uncategorized, not deleted.`
      )
    )
      return;
    setCategoryError('');
    try {
      await api.deleteCategory(category.id);
      await loadCategories();
      loadProducts();
    } catch (err) {
      setCategoryError(err.message);
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setCategoryError('');
    setAddingCategory(true);
    try {
      await api.createCategory({ name: newCategory.trim() });
      setNewCategory('');
      await loadCategories();
    } catch (err) {
      setCategoryError(err.message);
    } finally {
      setAddingCategory(false);
    }
  }

  return (
    <div className="container admin-page">
      <h1>Stall management</h1>
      <p className="auth-sub">Add new products, manage categories, or remove existing ones.</p>

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
                <ProductRow
                  key={p.id}
                  product={p}
                  categories={categories}
                  onSave={handleUpdateProduct}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-categories">
        <h2>Categories</h2>
        {categoryError && <div className="error-banner">{categoryError}</div>}

        <div className="category-list">
          {categories.map((c) => (
            <CategoryRow
              key={c.id}
              category={c}
              onRename={handleRenameCategory}
              onDelete={handleDeleteCategory}
            />
          ))}
        </div>

        <form className="category-add-form" onSubmit={handleAddCategory}>
          <input
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button className="btn btn-sm btn-primary" type="submit" disabled={addingCategory}>
            {addingCategory ? 'Adding…' : 'Add category'}
          </button>
        </form>
      </div>
    </div>
  );
}

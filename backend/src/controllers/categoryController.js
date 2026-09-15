const pool = require('../config/db');
const { slugify } = require('../utils/slugify');

// GET /api/categories
async function listCategories(req, res) {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json({ categories: result.rows });
  } catch (err) {
    console.error('List categories error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/categories (admin)
async function createCategory(req, res) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });

  try {
    const slug = slugify(name);
    const result = await pool.query(
      `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *`,
      [name, slug, description || null]
    );
    res.status(201).json({ category: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Category already exists' });
    }
    console.error('Create category error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/categories/:id (admin)
async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const slug = name ? slugify(name) : undefined;
    const result = await pool.query(
      `UPDATE categories SET
         name = COALESCE($1, name),
         slug = COALESCE($2, slug),
         description = COALESCE($3, description)
       WHERE id = $4
       RETURNING *`,
      [name || null, slug || null, description ?? null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Category not found' });
    res.json({ category: result.rows[0] });
  } catch (err) {
    console.error('Update category error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/categories/:id (admin)
async function deleteCategory(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Delete category error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };

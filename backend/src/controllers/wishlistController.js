const pool = require('../config/db');

// GET /api/wishlist
async function getWishlist(req, res) {
  try {
    const result = await pool.query(
      `SELECT wi.id, wi.created_at,
              p.id AS product_id, p.name, p.slug, p.price, p.image_url
       FROM wishlist_items wi
       JOIN products p ON p.id = wi.product_id
       WHERE wi.user_id = $1
       ORDER BY wi.created_at DESC`,
      [req.user.id]
    );
    res.json({ items: result.rows });
  } catch (err) {
    console.error('Get wishlist error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/wishlist  { product_id }
async function addToWishlist(req, res) {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ message: 'product_id is required' });

  try {
    const result = await pool.query(
      `INSERT INTO wishlist_items (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [req.user.id, product_id]
    );
    res.status(201).json({ item: result.rows[0] || { message: 'Already in wishlist' } });
  } catch (err) {
    console.error('Add to wishlist error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/wishlist/:id
async function removeFromWishlist(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Wishlist item not found' });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error('Remove from wishlist error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };

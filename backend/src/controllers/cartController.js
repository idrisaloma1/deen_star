const pool = require('../config/db');

// GET /api/cart
async function getCart(req, res) {
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.quantity, ci.created_at,
              p.id AS product_id, p.name, p.slug, p.price, p.image_url, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );
    const items = result.rows;
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    res.json({ items, total });
  } catch (err) {
    console.error('Get cart error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/cart  { product_id, quantity }
async function addToCart(req, res) {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ message: 'product_id is required' });
  if (quantity < 1) return res.status(400).json({ message: 'quantity must be at least 1' });

  try {
    const product = await pool.query('SELECT id, stock_quantity FROM products WHERE id = $1 AND is_active = true', [product_id]);
    if (product.rows.length === 0) return res.status(404).json({ message: 'Product not found' });

    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING *`,
      [req.user.id, product_id, quantity]
    );
    res.status(201).json({ item: result.rows[0] });
  } catch (err) {
    console.error('Add to cart error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/cart/:id  { quantity }
async function updateCartItem(req, res) {
  const { id } = req.params;
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ message: 'quantity must be at least 1' });

  try {
    const result = await pool.query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [quantity, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Cart item not found' });
    res.json({ item: result.rows[0] });
  } catch (err) {
    console.error('Update cart item error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/cart/:id
async function removeFromCart(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Cart item not found' });
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove from cart error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/cart  (clear cart)
async function clearCart(req, res) {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear cart error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };

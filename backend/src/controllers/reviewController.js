const pool = require('../config/db');

// GET /api/reviews/product/:productId
async function getProductReviews(req, res) {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      `SELECT r.*, u.full_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );
    res.json({ reviews: result.rows });
  } catch (err) {
    console.error('Get reviews error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/reviews  { product_id, rating, comment }
async function createReview(req, res) {
  const { product_id, rating, comment } = req.body;
  if (!product_id || !rating) {
    return res.status(400).json({ message: 'product_id and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'rating must be between 1 and 5' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (product_id, user_id)
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
       RETURNING *`,
      [product_id, req.user.id, rating, comment || null]
    );
    res.status(201).json({ review: result.rows[0] });
  } catch (err) {
    console.error('Create review error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/reviews/:id  (owner or admin)
async function deleteReview(req, res) {
  const { id } = req.params;
  try {
    const reviewResult = await pool.query('SELECT user_id FROM reviews WHERE id = $1', [id]);
    if (reviewResult.rows.length === 0) return res.status(404).json({ message: 'Review not found' });

    if (reviewResult.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('Delete review error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getProductReviews, createReview, deleteReview };

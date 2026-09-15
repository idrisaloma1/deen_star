const pool = require('../config/db');

// POST /api/orders  { shipping_address, shipping_phone, notes }
// Creates an order from the user's current cart contents.
async function placeOrder(req, res) {
  const { shipping_address, shipping_phone, notes } = req.body;
  if (!shipping_address || !shipping_phone) {
    return res.status(400).json({ message: 'shipping_address and shipping_phone are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cartResult = await client.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       FOR UPDATE OF p`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock
    for (const item of cartResult.rows) {
      if (item.quantity > item.stock_quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Insufficient stock for "${item.name}"` });
      }
    }

    const totalAmount = cartResult.rows.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, shipping_phone, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, totalAmount, shipping_address, shipping_phone, notes || null]
    );
    const order = orderResult.rows[0];

    for (const item of cartResult.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.name, item.price, item.quantity, Number(item.price) * item.quantity]
      );
      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query(
      `INSERT INTO order_status_history (order_id, status, note) VALUES ($1, 'pending', 'Order placed')`,
      [order.id]
    );

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');
    res.status(201).json({ order });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Place order error:', err.message);
    res.status(500).json({ message: 'Server error while placing order' });
  } finally {
    client.release();
  }
}

// GET /api/orders  (current user's orders)
async function listMyOrders(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ orders: result.rows });
  } catch (err) {
    console.error('List orders error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/orders/:id  (owner or admin) — includes items + status history for tracking
async function getOrderById(req, res) {
  const { id } = req.params;
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) return res.status(404).json({ message: 'Order not found' });

    const order = orderResult.rows[0];
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    const historyResult = await pool.query(
      'SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY changed_at ASC',
      [id]
    );

    res.json({ order, items: itemsResult.rows, history: historyResult.rows });
  } catch (err) {
    console.error('Get order error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/orders/admin/all  (admin) — all orders
async function listAllOrders(req, res) {
  try {
    const result = await pool.query(
      `SELECT o.*, u.full_name, u.email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
    res.json({ orders: result.rows });
  } catch (err) {
    console.error('List all orders error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/orders/:id/status  (admin)  { status, note }
async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status, note } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Order not found' });
    }
    await client.query(
      `INSERT INTO order_status_history (order_id, status, note) VALUES ($1, $2, $3)`,
      [id, status, note || null]
    );
    await client.query('COMMIT');
    res.json({ order: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update order status error:', err.message);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
}

module.exports = {
  placeOrder,
  listMyOrders,
  getOrderById,
  listAllOrders,
  updateOrderStatus
};

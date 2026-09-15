const pool = require('../config/db');
const { slugify } = require('../utils/slugify');

// GET /api/products?search=&category=&minPrice=&maxPrice=&page=&limit=&sort=
async function listProducts(req, res) {
  const {
    search,
    category, // category slug
    minPrice,
    maxPrice,
    page = 1,
    limit = 12,
    sort = 'newest' // newest | price_asc | price_desc
  } = req.query;

  const conditions = ['p.is_active = true'];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(`p.name ILIKE $${idx}`);
    values.push(`%${search}%`);
    idx++;
  }
  if (category) {
    conditions.push(`c.slug = $${idx}`);
    values.push(category);
    idx++;
  }
  if (minPrice) {
    conditions.push(`p.price >= $${idx}`);
    values.push(minPrice);
    idx++;
  }
  if (maxPrice) {
    conditions.push(`p.price <= $${idx}`);
    values.push(maxPrice);
    idx++;
  }

  const sortMap = {
    newest: 'p.created_at DESC',
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC'
  };
  const orderBy = sortMap[sort] || sortMap.newest;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
  const offset = (pageNum - 1) * limitNum;

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
              COALESCE(AVG(r.rating), 0)::float AS avg_rating,
              COUNT(r.id)::int AS review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON r.product_id = p.id
       ${whereClause}
       GROUP BY p.id, c.name, c.slug
       ORDER BY ${orderBy}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limitNum, offset]
    );

    res.json({
      products: dataResult.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('List products error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/products/:slug
async function getProductBySlug(req, res) {
  const { slug } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
              COALESCE(AVG(r.rating), 0)::float AS avg_rating,
              COUNT(r.id)::int AS review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON r.product_id = p.id
       WHERE p.slug = $1 AND p.is_active = true
       GROUP BY p.id, c.name, c.slug`,
      [slug]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error('Get product error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/products (admin)
async function createProduct(req, res) {
  const { name, description, price, stock_quantity, category_id, image_url } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ message: 'name and price are required' });
  }

  try {
    const slug = slugify(name) + '-' + Date.now().toString(36);
    const result = await pool.query(
      `INSERT INTO products (name, slug, description, price, stock_quantity, category_id, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, slug, description || null, price, stock_quantity || 0, category_id || null, image_url || null, req.user.id]
    );
    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    console.error('Create product error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/products/:id (admin)
async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, description, price, stock_quantity, category_id, image_url, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         stock_quantity = COALESCE($4, stock_quantity),
         category_id = COALESCE($5, category_id),
         image_url = COALESCE($6, image_url),
         is_active = COALESCE($7, is_active),
         updated_at = now()
       WHERE id = $8
       RETURNING *`,
      [name || null, description ?? null, price ?? null, stock_quantity ?? null, category_id || null, image_url ?? null, is_active ?? null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error('Update product error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/products/:id (admin)
async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
};

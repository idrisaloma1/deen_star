const express = require('express');
const router = express.Router();
const {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', listProducts);
router.get('/:slug', getProductBySlug);
router.post('/', requireAuth, requireAdmin, createProduct);
router.put('/:id', requireAuth, requireAdmin, updateProduct);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

module.exports = router;

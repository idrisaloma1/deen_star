const express = require('express');
const router = express.Router();
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', listCategories);
router.post('/', requireAuth, requireAdmin, createCategory);
router.put('/:id', requireAuth, requireAdmin, updateCategory);
router.delete('/:id', requireAuth, requireAdmin, deleteCategory);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  placeOrder,
  listMyOrders,
  getOrderById,
  listAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);

router.get('/admin/all', requireAdmin, listAllOrders);
router.post('/', placeOrder);
router.get('/', listMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', requireAdmin, updateOrderStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getBills, getBill, createBill, updateBill, deleteBill,
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getBills)
  .post(authorize('admin', 'receptionist'), createBill);
router.route('/:id')
  .get(getBill)
  .put(authorize('admin', 'receptionist'), updateBill)
  .delete(authorize('admin'), deleteBill);

module.exports = router;

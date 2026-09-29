const express = require('express');
const router = express.Router();
const {
  getStaff, getStaffMember, createStaff, updateStaff, deleteStaff,
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.route('/').get(getStaff).post(createStaff);
router.route('/:id').get(getStaffMember).put(updateStaff).delete(deleteStaff);

module.exports = router;

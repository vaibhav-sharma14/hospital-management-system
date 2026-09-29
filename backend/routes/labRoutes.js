const express = require('express');
const router = express.Router();
const {
  getLabTests, getLabTest, createLabTest, updateLabTest, deleteLabTest,
} = require('../controllers/labController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getLabTests)
  .post(authorize('admin', 'doctor', 'lab_technician'), createLabTest);
router.route('/:id')
  .get(getLabTest)
  .put(authorize('admin', 'lab_technician'), updateLabTest)
  .delete(authorize('admin', 'lab_technician'), deleteLabTest);

module.exports = router;

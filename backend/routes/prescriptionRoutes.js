const express = require('express');
const router = express.Router();
const {
  getPrescriptions, getPrescription, createPrescription, updatePrescription, deletePrescription,
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getPrescriptions)
  .post(authorize('admin', 'doctor'), createPrescription);
router.route('/:id')
  .get(getPrescription)
  .put(authorize('admin', 'doctor'), updatePrescription)
  .delete(authorize('admin', 'doctor'), deletePrescription);

module.exports = router;

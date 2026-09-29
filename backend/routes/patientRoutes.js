const express = require('express');
const router = express.Router();
const {
  getPatients, getPatient, createPatient, updatePatient, deletePatient,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getPatients)
  .post(authorize('admin', 'receptionist', 'doctor'), createPatient);
router.route('/:id')
  .get(getPatient)
  .put(authorize('admin', 'receptionist', 'doctor'), updatePatient)
  .delete(authorize('admin'), deletePatient);

module.exports = router;

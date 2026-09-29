const express = require('express');
const router = express.Router();
const {
  getAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getAppointments)
  .post(authorize('admin', 'receptionist', 'patient', 'doctor'), createAppointment);
router.route('/:id')
  .get(getAppointment)
  .put(authorize('admin', 'receptionist', 'doctor'), updateAppointment)
  .delete(authorize('admin', 'receptionist'), deleteAppointment);

module.exports = router;

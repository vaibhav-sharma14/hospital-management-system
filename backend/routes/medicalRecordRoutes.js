const express = require('express');
const router = express.Router();
const {
  getMedicalRecords, getMedicalRecord, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord,
} = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getMedicalRecords)
  .post(authorize('admin', 'doctor'), createMedicalRecord);
router.route('/:id')
  .get(getMedicalRecord)
  .put(authorize('admin', 'doctor'), updateMedicalRecord)
  .delete(authorize('admin', 'doctor'), deleteMedicalRecord);

module.exports = router;

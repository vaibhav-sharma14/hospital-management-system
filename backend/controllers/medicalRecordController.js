const asyncHandler = require('express-async-handler');
const MedicalRecord = require('../models/MedicalRecord');
const paginate = require('../utils/paginate');

const getMedicalRecords = asyncHandler(async (req, res) => {
  let baseFilter = {};
  if (req.user.role === 'patient' && req.user.patientProfile) {
    baseFilter = { patient: req.user.patientProfile };
  }
  const result = await paginate(MedicalRecord, req, {
    searchFields: ['diagnosis', 'symptoms'],
    filterFields: ['patient', 'doctor'],
    populate: [
      { path: 'patient', select: 'name patientId' },
      { path: 'doctor', select: 'name specialization' },
    ],
    baseFilter,
  });
  res.json({ success: true, ...result });
});

const getMedicalRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id).populate('patient doctor');
  if (!record) {
    res.status(404);
    throw new Error('Medical record not found');
  }
  res.json({ success: true, record });
});

const createMedicalRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.create(req.body);
  res.status(201).json({ success: true, record });
});

const updateMedicalRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!record) {
    res.status(404);
    throw new Error('Medical record not found');
  }
  res.json({ success: true, record });
});

const deleteMedicalRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findByIdAndDelete(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Medical record not found');
  }
  res.json({ success: true, message: 'Medical record removed' });
});

module.exports = { getMedicalRecords, getMedicalRecord, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord };

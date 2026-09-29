const asyncHandler = require('express-async-handler');
const Prescription = require('../models/Prescription');
const paginate = require('../utils/paginate');

const getPrescriptions = asyncHandler(async (req, res) => {
  let baseFilter = {};
  if (req.user.role === 'patient' && req.user.patientProfile) {
    baseFilter = { patient: req.user.patientProfile };
  } else if (req.user.role === 'doctor' && req.user.doctorProfile) {
    baseFilter = { doctor: req.user.doctorProfile };
  }

  const result = await paginate(Prescription, req, {
    searchFields: ['diagnosis'],
    filterFields: ['status', 'patient', 'doctor'],
    populate: [
      { path: 'patient', select: 'name patientId' },
      { path: 'doctor', select: 'name specialization' },
    ],
    baseFilter,
  });
  res.json({ success: true, ...result });
});

const getPrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id).populate('patient doctor appointment');
  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }
  res.json({ success: true, prescription });
});

const createPrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.create(req.body);
  res.status(201).json({ success: true, prescription });
});

const updatePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }
  res.json({ success: true, prescription });
});

const deletePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findByIdAndDelete(req.params.id);
  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }
  res.json({ success: true, message: 'Prescription removed' });
});

module.exports = { getPrescriptions, getPrescription, createPrescription, updatePrescription, deletePrescription };

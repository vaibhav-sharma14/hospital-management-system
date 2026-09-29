const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');
const paginate = require('../utils/paginate');

const getPatients = asyncHandler(async (req, res) => {
  // Patients can only see their own record; staff see everyone
  const baseFilter = req.user.role === 'patient' ? { user: req.user._id } : {};
  const result = await paginate(Patient, req, {
    searchFields: ['name', 'phone', 'email', 'patientId'],
    filterFields: ['status', 'gender', 'bloodGroup'],
    populate: ['assignedDoctor'],
    baseFilter,
  });
  res.json({ success: true, ...result });
});

const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('assignedDoctor');
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  res.json({ success: true, patient });
});

const createPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.create(req.body);
  res.status(201).json({ success: true, patient });
});

const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  res.json({ success: true, patient });
});

const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  res.json({ success: true, message: 'Patient removed' });
});

module.exports = { getPatients, getPatient, createPatient, updatePatient, deletePatient };

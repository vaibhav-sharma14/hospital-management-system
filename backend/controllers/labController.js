const asyncHandler = require('express-async-handler');
const LabTest = require('../models/LabTest');
const Notification = require('../models/Notification');
const paginate = require('../utils/paginate');

const getLabTests = asyncHandler(async (req, res) => {
  let baseFilter = {};
  if (req.user.role === 'patient' && req.user.patientProfile) {
    baseFilter = { patient: req.user.patientProfile };
  }
  const result = await paginate(LabTest, req, {
    searchFields: ['testId', 'testName', 'testType'],
    filterFields: ['status', 'patient', 'doctor'],
    populate: [
      { path: 'patient', select: 'name patientId' },
      { path: 'doctor', select: 'name' },
      { path: 'technician', select: 'name' },
    ],
    baseFilter,
  });
  res.json({ success: true, ...result });
});

const getLabTest = asyncHandler(async (req, res) => {
  const test = await LabTest.findById(req.params.id).populate('patient doctor technician');
  if (!test) {
    res.status(404);
    throw new Error('Lab test not found');
  }
  res.json({ success: true, test });
});

const createLabTest = asyncHandler(async (req, res) => {
  const test = await LabTest.create(req.body);
  res.status(201).json({ success: true, test });
});

const updateLabTest = asyncHandler(async (req, res) => {
  const test = await LabTest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('patient');

  if (!test) {
    res.status(404);
    throw new Error('Lab test not found');
  }

  // Notify patient's linked user account when results are ready
  if (req.body.status === 'completed' && test.patient?.user) {
    await Notification.create({
      recipient: test.patient.user,
      title: 'Lab results ready',
      message: `Your test "${test.testName}" (${test.testId}) results are now available.`,
      type: 'lab',
    });
  }

  res.json({ success: true, test });
});

const deleteLabTest = asyncHandler(async (req, res) => {
  const test = await LabTest.findByIdAndDelete(req.params.id);
  if (!test) {
    res.status(404);
    throw new Error('Lab test not found');
  }
  res.json({ success: true, message: 'Lab test removed' });
});

module.exports = { getLabTests, getLabTest, createLabTest, updateLabTest, deleteLabTest };

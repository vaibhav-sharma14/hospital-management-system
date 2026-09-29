const asyncHandler = require('express-async-handler');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const paginate = require('../utils/paginate');

// @desc List doctors (search by name/specialization, filter by department/status)
const getDoctors = asyncHandler(async (req, res) => {
  const result = await paginate(Doctor, req, {
    searchFields: ['name', 'specialization', 'email'],
    filterFields: ['department', 'status'],
    populate: ['department'],
  });
  res.json({ success: true, ...result });
});

const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('department');
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  res.json({ success: true, doctor });
});

// @desc Create doctor: creates linked User account (role=doctor) + Doctor profile
const createDoctor = asyncHandler(async (req, res) => {
  const {
    name, email, password, phone, department, specialization,
    qualification, experienceYears, consultationFee, availableDays, shiftStart, shiftEnd,
  } = req.body;

  if (!name || !email || !password || !department || !specialization) {
    res.status(400);
    throw new Error('Name, email, password, department and specialization are required');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error('A user with this email already exists');
  }

  const user = await User.create({ name, email, password, phone, role: 'doctor' });

  const doctor = await Doctor.create({
    user: user._id, name, email, phone, department, specialization,
    qualification, experienceYears, consultationFee, availableDays, shiftStart, shiftEnd,
  });

  user.doctorProfile = doctor._id;
  await user.save();

  res.status(201).json({ success: true, doctor });
});

const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('department');
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  res.json({ success: true, doctor });
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  await User.findByIdAndUpdate(doctor.user, { isActive: false });
  await doctor.deleteOne();
  res.json({ success: true, message: 'Doctor removed' });
});

module.exports = { getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor };

const asyncHandler = require('express-async-handler');
const Staff = require('../models/Staff');
const User = require('../models/User');
const paginate = require('../utils/paginate');

const getStaff = asyncHandler(async (req, res) => {
  const result = await paginate(Staff, req, {
    searchFields: ['name', 'employeeId'],
    filterFields: ['role', 'status', 'department'],
    populate: ['department'],
  });
  res.json({ success: true, ...result });
});

const getStaffMember = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id).populate('department user');
  if (!staff) {
    res.status(404);
    throw new Error('Staff member not found');
  }
  res.json({ success: true, staff });
});

// @desc Create staff: creates linked User account + Staff profile
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, department, joiningDate, salary, shift } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Name, email, password and role are required');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error('A user with this email already exists');
  }

  const user = await User.create({ name, email, password, phone, role });
  const staff = await Staff.create({
    user: user._id, name, role, department, phone, joiningDate, salary, shift,
  });
  user.staffProfile = staff._id;
  await user.save();

  res.status(201).json({ success: true, staff });
});

const updateStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('department');
  if (!staff) {
    res.status(404);
    throw new Error('Staff member not found');
  }
  res.json({ success: true, staff });
});

const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  if (!staff) {
    res.status(404);
    throw new Error('Staff member not found');
  }
  await User.findByIdAndUpdate(staff.user, { isActive: false });
  await staff.deleteOne();
  res.json({ success: true, message: 'Staff member removed' });
});

module.exports = { getStaff, getStaffMember, createStaff, updateStaff, deleteStaff };

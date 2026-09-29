const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Doctor = require('../models/Doctor');
const paginate = require('../utils/paginate');

// @desc    Admin: list all users with pagination/search/filter (by role)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const result = await paginate(User, req, {
    searchFields: ['name', 'email'],
    filterFields: ['role', 'isActive'],
  });
  res.json({ success: true, ...result });
});

// @desc    Admin: create a staff/doctor/admin user account
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Name, email, password and role are required');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error('A user with this email already exists');
  }

  const user = await User.create({ name, email, password, role, phone });
  res.status(201).json({ success: true, user: user.toSafeObject() });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc    Update user (admin) - role, active status, basic info
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'role', 'isActive', 'gender', 'address'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ success: true, user });
});

// @desc    Delete (deactivate) user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await Staff.deleteMany({ user: user._id });
  await Doctor.deleteMany({ user: user._id });
  await user.deleteOne();
  res.json({ success: true, message: 'User removed' });
});

module.exports = { getUsers, createUser, getUser, updateUser, deleteUser };

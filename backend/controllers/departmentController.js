const asyncHandler = require('express-async-handler');
const Department = require('../models/Department');
const paginate = require('../utils/paginate');

const getDepartments = asyncHandler(async (req, res) => {
  const result = await paginate(Department, req, {
    searchFields: ['name', 'location'],
    filterFields: ['isActive'],
    populate: ['headOfDepartment'],
  });
  res.json({ success: true, ...result });
});

const getDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findById(req.params.id).populate('headOfDepartment');
  if (!dept) {
    res.status(404);
    throw new Error('Department not found');
  }
  res.json({ success: true, department: dept });
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, department });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  res.json({ success: true, department });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  res.json({ success: true, message: 'Department removed' });
});

module.exports = { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };

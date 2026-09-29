const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');
const paginate = require('../utils/paginate');

const getMedicines = asyncHandler(async (req, res) => {
  const result = await paginate(Medicine, req, {
    searchFields: ['name', 'category', 'manufacturer'],
    filterFields: ['category'],
  });
  res.json({ success: true, ...result });
});

const getMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  res.json({ success: true, medicine });
});

const createMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.create(req.body);
  res.status(201).json({ success: true, medicine });
});

const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  res.json({ success: true, medicine });
});

// @desc Dispense stock (decrement quantity) - used by pharmacist workflow
const dispenseMedicine = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  if (medicine.stockQuantity < quantity) {
    res.status(400);
    throw new Error('Insufficient stock available');
  }
  medicine.stockQuantity -= quantity;
  await medicine.save();
  res.json({ success: true, medicine });
});

const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);
  if (!medicine) {
    res.status(404);
    throw new Error('Medicine not found');
  }
  res.json({ success: true, message: 'Medicine removed' });
});

module.exports = { getMedicines, getMedicine, createMedicine, updateMedicine, dispenseMedicine, deleteMedicine };

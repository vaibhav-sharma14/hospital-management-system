const asyncHandler = require('express-async-handler');
const Bill = require('../models/Bill');
const paginate = require('../utils/paginate');

const getBills = asyncHandler(async (req, res) => {
  let baseFilter = {};
  if (req.user.role === 'patient' && req.user.patientProfile) {
    baseFilter = { patient: req.user.patientProfile };
  }
  const result = await paginate(Bill, req, {
    searchFields: ['invoiceNumber'],
    filterFields: ['status', 'patient', 'paymentMethod'],
    populate: [{ path: 'patient', select: 'name patientId phone' }],
    baseFilter,
  });
  res.json({ success: true, ...result });
});

const getBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate('patient issuedBy');
  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }
  res.json({ success: true, bill });
});

const createBill = asyncHandler(async (req, res) => {
  const { items = [], discount = 0, tax = 0 } = req.body;
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalAmount = Math.max(subtotal - discount + tax, 0);

  const itemsWithTotals = items.map((item) => ({ ...item, total: item.quantity * item.unitPrice }));

  const bill = await Bill.create({
    ...req.body,
    items: itemsWithTotals,
    subtotal,
    totalAmount,
    issuedBy: req.user._id,
  });

  res.status(201).json({ success: true, bill });
});

const updateBill = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (body.items) {
    body.subtotal = body.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    body.items = body.items.map((item) => ({ ...item, total: item.quantity * item.unitPrice }));
    body.totalAmount = Math.max(body.subtotal - (body.discount || 0) + (body.tax || 0), 0);
  }

  if (body.amountPaid !== undefined) {
    const existing = await Bill.findById(req.params.id);
    const total = body.totalAmount ?? existing?.totalAmount ?? 0;
    if (body.amountPaid >= total) body.status = 'paid';
    else if (body.amountPaid > 0) body.status = 'partial';
    else body.status = 'pending';
  }

  const bill = await Bill.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }
  res.json({ success: true, bill });
});

const deleteBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findByIdAndDelete(req.params.id);
  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }
  res.json({ success: true, message: 'Bill removed' });
});

module.exports = { getBills, getBill, createBill, updateBill, deleteBill };

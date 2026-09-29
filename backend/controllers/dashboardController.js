const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');
const LabTest = require('../models/LabTest');
const Department = require('../models/Department');

// @desc    Aggregated dashboard stats & chart data (role-aware)
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const [
    totalPatients,
    totalDoctors,
    totalDepartments,
    todaysAppointments,
    pendingLabTests,
    lowStockMedicines,
    revenueAgg,
    appointmentsByStatus,
    appointmentsByMonth,
    revenueByMonth,
    departmentLoad,
  ] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments({ status: 'active' }),
    Department.countDocuments({ isActive: true }),
    Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
    LabTest.countDocuments({ status: { $in: ['pending', 'sample_collected', 'in_progress'] } }),
    Medicine.countDocuments({ $expr: { $lte: ['$stockQuantity', '$reorderLevel'] } }),
    Bill.aggregate([
      { $match: { status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Appointment.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      { $group: { _id: { y: { $year: '$date' }, m: { $month: '$date' } }, count: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
    Bill.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          revenue: { $sum: '$amountPaid' },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
    Doctor.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$dept.name', 'Unassigned'] }, count: 1, _id: 0 } },
    ]),
  ]);

  const monthLabel = (y, m) =>
    new Date(y, m - 1).toLocaleString('en-US', { month: 'short' });

  res.json({
    success: true,
    stats: {
      totalPatients,
      totalDoctors,
      totalDepartments,
      todaysAppointments,
      pendingLabTests,
      lowStockMedicines,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
    charts: {
      appointmentsByStatus: appointmentsByStatus.map((a) => ({ status: a._id, count: a.count })),
      appointmentsByMonth: appointmentsByMonth.map((a) => ({
        month: monthLabel(a._id.y, a._id.m),
        count: a.count,
      })),
      revenueByMonth: revenueByMonth.map((r) => ({
        month: monthLabel(r._id.y, r._id.m),
        revenue: r.revenue,
      })),
      departmentLoad,
    },
  });
});

module.exports = { getStats };

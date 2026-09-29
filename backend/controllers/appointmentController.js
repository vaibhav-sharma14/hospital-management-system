const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Doctor = require('../models/Doctor');
const paginate = require('../utils/paginate');

const getAppointments = asyncHandler(async (req, res) => {
  let baseFilter = {};
  if (req.user.role === 'patient' && req.user.patientProfile) {
    baseFilter = { patient: req.user.patientProfile };
  } else if (req.user.role === 'doctor' && req.user.doctorProfile) {
    baseFilter = { doctor: req.user.doctorProfile };
  }

  const result = await paginate(Appointment, req, {
    searchFields: ['appointmentId', 'reason'],
    filterFields: ['status', 'doctor', 'patient', 'department'],
    populate: [
      { path: 'patient', select: 'name patientId phone' },
      { path: 'doctor', select: 'name specialization' },
      { path: 'department', select: 'name' },
    ],
    baseFilter,
  });
  res.json({ success: true, ...result });
});

const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient doctor department');
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  res.json({ success: true, appointment });
});

const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.create({ ...req.body, createdBy: req.user._id });

  const doctor = await Doctor.findById(appointment.doctor);
  if (doctor) {
    await Notification.create({
      recipient: doctor.user,
      title: 'New appointment booked',
      message: `A new appointment (${appointment.appointmentId}) has been scheduled.`,
      type: 'appointment',
    });
  }

  res.status(201).json({ success: true, appointment });
});

const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('patient doctor department');
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  res.json({ success: true, appointment });
});

const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  res.json({ success: true, message: 'Appointment removed' });
});

module.exports = { getAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment };

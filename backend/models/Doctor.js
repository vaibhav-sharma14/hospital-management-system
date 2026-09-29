const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    specialization: { type: String, required: true, trim: true },
    qualification: { type: String, trim: true },
    experienceYears: { type: Number, default: 0, min: 0 },
    consultationFee: { type: Number, default: 0, min: 0 },
    availableDays: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
    shiftStart: { type: String, default: '09:00' },
    shiftEnd: { type: String, default: '17:00' },
    status: { type: String, enum: ['active', 'on_leave', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);

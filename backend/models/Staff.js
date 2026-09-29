const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['receptionist', 'lab_technician', 'pharmacist', 'nurse', 'admin_staff'],
      required: true,
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    phone: { type: String, trim: true },
    joiningDate: { type: Date, default: Date.now },
    salary: { type: Number, min: 0 },
    shift: { type: String, enum: ['morning', 'evening', 'night'], default: 'morning' },
    status: { type: String, enum: ['active', 'on_leave', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

staffSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Staff').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Staff', staffSchema);

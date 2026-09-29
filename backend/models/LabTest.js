const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    testId: { type: String, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    testName: { type: String, required: true, trim: true },
    testType: { type: String, trim: true },
    sampleCollectedAt: { type: Date },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'sample_collected', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
    result: { type: String, trim: true },
    resultFile: { type: String },
    cost: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

labTestSchema.pre('save', async function (next) {
  if (!this.testId) {
    const count = await mongoose.model('LabTest').countDocuments();
    this.testId = `LAB${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('LabTest', labTestSchema);

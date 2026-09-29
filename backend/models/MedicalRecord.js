const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    visitDate: { type: Date, default: Date.now },
    symptoms: { type: String, trim: true },
    diagnosis: { type: String, trim: true },
    treatment: { type: String, trim: true },
    vitals: {
      temperature: Number,
      bloodPressure: String,
      heartRate: Number,
      weight: Number,
      height: Number,
    },
    attachments: [{ fileName: String, fileUrl: String }],
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);

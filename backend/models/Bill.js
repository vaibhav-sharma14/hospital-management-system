const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: ['consultation', 'lab_test', 'medicine', 'procedure', 'room', 'other'], default: 'other' },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    items: [billItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'insurance', 'other'], default: 'cash' },
    status: { type: String, enum: ['pending', 'partial', 'paid', 'cancelled'], default: 'pending' },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

billSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Bill').countDocuments();
    this.invoiceNumber = `INV${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);

const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    batchNumber: { type: String, trim: true },
    unit: { type: String, default: 'tablet' },
    pricePerUnit: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, default: 20 },
    expiryDate: { type: Date, required: true },
    supplier: { type: String, trim: true },
  },
  { timestamps: true }
);

medicineSchema.virtual('stockStatus').get(function () {
  if (this.stockQuantity === 0) return 'out_of_stock';
  if (this.stockQuantity <= this.reorderLevel) return 'low_stock';
  return 'in_stock';
});
medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);

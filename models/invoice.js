const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    billingAddress: { type: String, required: true }
  },
  items: [invoiceItemSchema],
  status: { type: String, enum: ['Draft', 'Pending', 'Paid'], default: 'Pending' },
  dueDate: { type: Date },
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  shareId: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
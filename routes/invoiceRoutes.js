const express = require('express');
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getPublicInvoice
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected Routes (Login required)
router.post('/invoice', protect, createInvoice);
router.get('/invoices', protect, getInvoices);
router.get('/invoice/:id', protect, getInvoiceById);
router.put('/invoice/:id', protect, updateInvoice);
router.delete('/invoice/:id', protect, deleteInvoice);

// Public Route (No Login required)
router.get('/public/invoice/:shareId', getPublicInvoice);

module.exports = router;
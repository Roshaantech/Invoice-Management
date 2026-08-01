const Invoice = require('../models/invoice');
const crypto = require('crypto');

// 1. Create Invoice
exports.createInvoice = async (req, res) => {
  try {
    const { customer, items, status, dueDate } = req.body;

    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    const calculatedItems = items.map(item => {
      const itemSub = Number(item.quantity) * Number(item.unitPrice);
      const taxAmt = (itemSub * (Number(item.tax) || 0)) / 100;
      const discAmt = Number(item.discount) || 0;
      const itemTotal = itemSub + taxAmt - discAmt;

      subtotal += itemSub;
      totalTax += taxAmt;
      totalDiscount += discAmt;

      return { ...item, total: itemTotal };
    });

    const grandTotal = subtotal + totalTax - totalDiscount;
    const shareId = crypto.randomBytes(6).toString('hex'); // Unique public URL shareId

    const newInvoice = new Invoice({
      user: req.user.id,
      customer,
      items: calculatedItems,
      status: status || 'Pending',
      dueDate,
      subtotal,
      taxAmount: totalTax,
      discountAmount: totalDiscount,
      grandTotal,
      shareId
    });

    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice', error: error.message });
  }
};

// 2. Get All Invoices for Logged-in User (With Search & Status Filter)
exports.getInvoices = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    if (search) {
      query['customer.name'] = { $regex: search, $options: 'i' };
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
};

// 3. Get Single Invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice || invoice.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice', error: error.message });
  }
};

// 4. Update Invoice
exports.updateInvoice = async (req, res) => {
  try {
    const { customer, items, status, dueDate } = req.body;
    let invoice = await Invoice.findById(req.params.id);

    if (!invoice || invoice.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    const calculatedItems = items.map(item => {
      const itemSub = Number(item.quantity) * Number(item.unitPrice);
      const taxAmt = (itemSub * (Number(item.tax) || 0)) / 100;
      const discAmt = Number(item.discount) || 0;
      const itemTotal = itemSub + taxAmt - discAmt;

      subtotal += itemSub;
      totalTax += taxAmt;
      totalDiscount += discAmt;

      return { ...item, total: itemTotal };
    });

    const grandTotal = subtotal + totalTax - totalDiscount;

    invoice.customer = customer || invoice.customer;
    invoice.items = calculatedItems || invoice.items;
    invoice.status = status || invoice.status;
    invoice.dueDate = dueDate || invoice.dueDate;
    invoice.subtotal = subtotal;
    invoice.taxAmount = totalTax;
    invoice.discountAmount = totalDiscount;
    invoice.grandTotal = grandTotal;

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error updating invoice', error: error.message });
  }
};

// 5. Delete Invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice || invoice.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice', error: error.message });
  }
};

// 6. Get Public Invoice (No Authentication Required)
exports.getPublicInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ shareId: req.params.shareId });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public invoice', error: error.message });
  }
};
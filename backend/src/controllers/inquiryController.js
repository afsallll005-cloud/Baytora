const Inquiry = require('../models/Inquiry');
const { getIsConnected, memoryStore } = require('../config/db');

// @desc    Submit an inquiry/contact agent lead
// @route   POST /api/inquiries
exports.createInquiry = async (req, res) => {
  try {
    const { propertyId, propertyTitle, propertyRef, name, email, phone, message, inquiryType = 'email' } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone number are required' });
    }

    const newInquiry = {
      propertyId: propertyId || null,
      propertyTitle: propertyTitle || 'General Rental Inquiry',
      propertyRef: propertyRef || 'GEN-01',
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone,
      message: message || `Hi, I am interested in this listing (${propertyRef}). Please get in touch.`,
      inquiryType,
      status: 'new',
    };

    const isConnected = getIsConnected();
    let result;

    if (isConnected) {
      result = await Inquiry.create(newInquiry);
    } else {
      result = {
        _id: 'inq_' + Date.now(),
        ...newInquiry,
        createdAt: new Date().toISOString(),
      };
      memoryStore.inquiries.push(result);
    }

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been sent to the agent. They will contact you shortly.',
      data: result,
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all inquiries
// @route   GET /api/inquiries
exports.getInquiries = async (req, res) => {
  try {
    const isConnected = getIsConnected();
    if (isConnected) {
      const list = await Inquiry.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: list.length, data: list });
    } else {
      return res.json({ success: true, count: memoryStore.inquiries.length, data: memoryStore.inquiries });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update inquiry status
// @route   PATCH /api/inquiries/:id
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const isConnected = getIsConnected();

    if (!status || !['new', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required (new, contacted, closed)' });
    }

    if (isConnected) {
      const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
      if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
      return res.json({ success: true, message: 'Status updated', data: inquiry });
    } else {
      const item = memoryStore.inquiries.find((i) => String(i._id) === id);
      if (!item) return res.status(404).json({ success: false, message: 'Inquiry not found' });
      item.status = status;
      return res.json({ success: true, message: 'Status updated', data: item });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const isConnected = getIsConnected();

    if (isConnected) {
      const deleted = await Inquiry.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Inquiry not found' });
      return res.json({ success: true, message: 'Inquiry deleted successfully' });
    } else {
      const initLen = memoryStore.inquiries.length;
      memoryStore.inquiries = memoryStore.inquiries.filter((i) => String(i._id) !== id);
      if (memoryStore.inquiries.length === initLen) {
        return res.status(404).json({ success: false, message: 'Inquiry not found' });
      }
      return res.json({ success: true, message: 'Inquiry deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

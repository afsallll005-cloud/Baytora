const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} = require('../controllers/inquiryController');

router.post('/', createInquiry);
router.get('/', getInquiries);
router.patch('/:id', updateInquiryStatus);
router.delete('/:id', deleteInquiry);

module.exports = router;

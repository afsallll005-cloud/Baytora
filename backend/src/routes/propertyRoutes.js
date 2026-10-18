const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  togglePropertyStatus,
  getAdminStats,
  getLocationsSummary,
} = require('../controllers/propertyController');

router.get('/admin/stats', getAdminStats);
router.get('/locations/summary', getLocationsSummary);
router.get('/', getProperties);
router.post('/', createProperty);
router.get('/:id', getPropertyById);
router.put('/:id', updateProperty);
router.patch('/:id/toggle-status', togglePropertyStatus);
router.delete('/:id', deleteProperty);

module.exports = router;

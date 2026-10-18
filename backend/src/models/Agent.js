const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    speaks: {
      type: [String],
      default: ['English', 'Arabic'],
    },
    specialties: {
      type: [String],
      default: ['Rentals', 'Luxury Villas', 'Apartments'],
    },
    closedDeals: {
      type: Number,
      default: 20,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    isSuperAgent: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Agent', agentSchema);

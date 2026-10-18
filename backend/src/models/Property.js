const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['rent', 'buy', 'commercial'],
      default: 'rent',
      required: true,
    },
    propertyType: {
      type: String,
      enum: ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Duplex', 'Studio', 'Commercial', 'Whole Building', 'Compound'],
      default: 'Apartment',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    pricePeriod: {
      type: String,
      enum: ['yearly', 'monthly', 'weekly', 'daily'],
      default: 'monthly',
    },
    currency: {
      type: String,
      default: 'BHD',
    },
    bedrooms: {
      type: Number,
      default: 1,
    },
    bathrooms: {
      type: Number,
      default: 1,
    },
    area: {
      type: Number, // In sqm
      required: true,
    },
    location: {
      governorate: {
        type: String,
        default: 'Capital Governorate',
      },
      city: {
        type: String,
        required: true,
      },
      building: {
        type: String,
        default: '',
      },
      address: {
        type: String,
        default: '',
      },
      coordinates: {
        lat: {
          type: Number,
          default: 27.9506,
        },
        lng: {
          type: Number,
          default: -82.4572,
        },
      },
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    furnished: {
      type: String,
      enum: ['Furnished', 'Unfurnished', 'Semi-Furnished'],
      default: 'Furnished',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isSuperAgent: {
      type: Boolean,
      default: false,
    },
    agent: {
      _id: { type: String },
      name: { type: String, default: 'RentelHome Premium Agent' },
      phone: { type: String, default: '+973 1700 8899' },
      whatsapp: { type: String, default: '97317008899' },
      email: { type: String, default: 'agent@rentelhome.com' },
      company: { type: String, default: 'Elite Real Estate Properties' },
      photo: { type: String, default: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80' },
      closedDeals: { type: Number, default: 42 },
      rating: { type: Number, default: 4.9 },
      isSuperAgent: { type: Boolean, default: true },
      specialties: { type: [String], default: [] },
    },
    referenceNumber: {
      type: String,
      unique: true,
      default: () => 'RH-' + Math.floor(100000 + Math.random() * 900000),
    },
  },
  {
    timestamps: true,
  }
);

propertySchema.index({ 'location.city': 1, category: 1, propertyType: 1, price: 1 });

module.exports = mongoose.model('Property', propertySchema);

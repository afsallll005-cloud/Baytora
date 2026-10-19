const Property = require('../models/Property');
const { getIsConnected, memoryStore } = require('../config/db');

// @desc    Get all properties with comprehensive filters
// @route   GET /api/properties
exports.getProperties = async (req, res) => {
  try {
    const {
      search,
      category,
      propertyType,
      minPrice,
      maxPrice,
      pricePeriod,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      furnished,
      amenities,
      governorate,
      city,
      sort = 'featured',
      page = 1,
      limit = 12,
    } = req.query;

    const isConnected = getIsConnected();

    if (isConnected) {
      const query = {};

      if (category && category !== 'all') {
        query.category = category.toLowerCase();
      }

      if (propertyType && propertyType !== 'all') {
        query.propertyType = propertyType;
      }

      if (furnished && furnished !== 'all') {
        query.furnished = furnished;
      }

      if (pricePeriod && pricePeriod !== 'all') {
        query.pricePeriod = pricePeriod;
      }

      if (governorate) {
        query['location.governorate'] = new RegExp(governorate, 'i');
      }

      if (city) {
        query['location.city'] = new RegExp(city, 'i');
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      if (minArea || maxArea) {
        query.area = {};
        if (minArea) query.area.$gte = Number(minArea);
        if (maxArea) query.area.$lte = Number(maxArea);
      }

      if (bedrooms !== undefined && bedrooms !== '' && bedrooms !== 'any') {
        if (bedrooms === '7+' || bedrooms === '4+') {
          query.bedrooms = { $gte: parseInt(bedrooms) };
        } else {
          query.bedrooms = Number(bedrooms);
        }
      }

      if (bathrooms !== undefined && bathrooms !== '' && bathrooms !== 'any') {
        if (bathrooms === '7+' || bathrooms === '4+') {
          query.bathrooms = { $gte: parseInt(bathrooms) };
        } else {
          query.bathrooms = Number(bathrooms);
        }
      }

      if (amenities) {
        const amenitiesList = Array.isArray(amenities)
          ? amenities
          : amenities.split(',').map((a) => a.trim());
        if (amenitiesList.length > 0) {
          query.amenities = { $all: amenitiesList };
        }
      }

      if (search) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { 'location.city': searchRegex },
          { 'location.building': searchRegex },
          { 'location.address': searchRegex },
          { 'location.governorate': searchRegex },
        ];
      }

      let sortOptions = { isFeatured: -1, createdAt: -1 };
      if (sort === 'price-asc') sortOptions = { price: 1 };
      if (sort === 'price-desc') sortOptions = { price: -1 };
      if (sort === 'newest') sortOptions = { createdAt: -1 };
      if (sort === 'beds-asc') sortOptions = { bedrooms: 1 };
      if (sort === 'beds-desc') sortOptions = { bedrooms: -1 };

      const skip = (Number(page) - 1) * Number(limit);
      const total = await Property.countDocuments(query);
      const properties = await Property.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

      return res.json({
        success: true,
        count: properties.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        data: properties,
      });
    } else {
      // Memory Fallback filtering
      let filtered = [...memoryStore.properties];

      if (category && category !== 'all') {
        filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }

      if (propertyType && propertyType !== 'all') {
        filtered = filtered.filter((p) => p.propertyType.toLowerCase() === propertyType.toLowerCase());
      }

      if (furnished && furnished !== 'all') {
        filtered = filtered.filter((p) => p.furnished.toLowerCase() === furnished.toLowerCase());
      }

      if (minPrice) {
        filtered = filtered.filter((p) => p.price >= Number(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter((p) => p.price <= Number(maxPrice));
      }

      if (minArea) {
        filtered = filtered.filter((p) => p.area >= Number(minArea));
      }
      if (maxArea) {
        filtered = filtered.filter((p) => p.area <= Number(maxArea));
      }

      if (bedrooms !== undefined && bedrooms !== '' && bedrooms !== 'any') {
        if (bedrooms === '4+' || bedrooms === '7+') {
          filtered = filtered.filter((p) => p.bedrooms >= parseInt(bedrooms));
        } else {
          filtered = filtered.filter((p) => p.bedrooms === Number(bedrooms));
        }
      }

      if (bathrooms !== undefined && bathrooms !== '' && bathrooms !== 'any') {
        filtered = filtered.filter((p) => p.bathrooms >= Number(bathrooms));
      }

      if (governorate) {
        filtered = filtered.filter((p) =>
          p.location.governorate.toLowerCase().includes(governorate.toLowerCase())
        );
      }

      if (city) {
        filtered = filtered.filter((p) =>
          p.location.city.toLowerCase().includes(city.toLowerCase())
        );
      }

      if (amenities) {
        const amenitiesList = Array.isArray(amenities)
          ? amenities
          : amenities.split(',').map((a) => a.trim().toLowerCase());
        filtered = filtered.filter((p) =>
          amenitiesList.every((a) =>
            p.amenities.map((item) => item.toLowerCase()).includes(a)
          )
        );
      }

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s) ||
            p.location.city.toLowerCase().includes(s) ||
            p.location.building.toLowerCase().includes(s) ||
            p.location.governorate.toLowerCase().includes(s)
        );
      }

      // Sort
      if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
      else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
      else if (sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      else if (sort === 'beds-asc') filtered.sort((a, b) => a.bedrooms - b.bedrooms);
      else if (sort === 'beds-desc') filtered.sort((a, b) => b.bedrooms - a.bedrooms);
      else filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

      const total = filtered.length;
      const skip = (Number(page) - 1) * Number(limit);
      const paginated = filtered.slice(skip, skip + Number(limit));

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        data: paginated,
      });
    }
  } catch (error) {
    console.error('Error in getProperties:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single property by ID or slug
// @route   GET /api/properties/:id
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const isConnected = getIsConnected();

    let property = null;

    if (isConnected) {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        property = await Property.findById(id);
      }
      if (!property) {
        property = await Property.findOne({ slug: id });
      }
      if (!property) {
        property = await Property.findOne({ referenceNumber: id });
      }
    } else {
      property = memoryStore.properties.find(
        (p) =>
          p._id === id ||
          p.slug === id ||
          p.referenceNumber === id ||
          String(p._id) === id
      );
    }

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Convert Mongoose doc to plain object if needed
    if (typeof property.toObject === 'function') {
      property = property.toObject();
    } else {
      property = JSON.parse(JSON.stringify(property));
    }

    // Dynamic Agent Sync: Ensure the property always presents up-to-date agent details
    const Agent = require('../models/Agent');
    if (isConnected) {
      if (property.agent) {
        const queryOr = [];
        if (property.agent._id) queryOr.push({ _id: property.agent._id });
        if (property.agent.id) queryOr.push({ _id: property.agent.id });
        if (property.agent.email) queryOr.push({ email: property.agent.email });
        if (property.agent.name) queryOr.push({ name: property.agent.name });

        if (queryOr.length > 0) {
          const matchedAgent = await Agent.findOne({ $or: queryOr }).lean();
          if (matchedAgent) {
            property.agent = {
              ...property.agent,
              _id: String(matchedAgent._id),
              name: matchedAgent.name,
              company: matchedAgent.company,
              photo: matchedAgent.photo,
              phone: matchedAgent.phone,
              whatsapp: matchedAgent.whatsapp || matchedAgent.phone?.replace(/[^0-9]/g, ''),
              email: matchedAgent.email,
              closedDeals: matchedAgent.closedDeals,
              rating: matchedAgent.rating,
              isSuperAgent: !!matchedAgent.isSuperAgent,
              specialties: matchedAgent.specialties,
            };
            property.isSuperAgent = !!matchedAgent.isSuperAgent;
          }
        }
      }
    } else {
      if (property.agent && memoryStore.agents) {
        const matchedAgent = memoryStore.agents.find(
          (a) =>
            (property.agent._id && (String(a._id) === String(property.agent._id) || String(a.id) === String(property.agent._id))) ||
            (property.agent.email && a.email?.toLowerCase() === property.agent.email?.toLowerCase()) ||
            (property.agent.name && a.name?.toLowerCase() === property.agent.name?.toLowerCase())
        );
        if (matchedAgent) {
          property.agent = {
            ...property.agent,
            _id: String(matchedAgent._id || matchedAgent.id),
            name: matchedAgent.name,
            company: matchedAgent.company,
            photo: matchedAgent.photo,
            phone: matchedAgent.phone,
            whatsapp: matchedAgent.whatsapp || matchedAgent.phone?.replace(/[^0-9]/g, ''),
            email: matchedAgent.email,
            closedDeals: matchedAgent.closedDeals,
            rating: matchedAgent.rating,
            isSuperAgent: !!matchedAgent.isSuperAgent,
            specialties: matchedAgent.specialties,
          };
          property.isSuperAgent = !!matchedAgent.isSuperAgent;
        }
      }
    }

    res.json({ success: true, data: property });
  } catch (error) {
    console.error('Error in getPropertyById:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new property
// @route   POST /api/properties
exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      category = 'rent',
      propertyType = 'Apartment',
      price,
      pricePeriod = 'monthly',
      currency = 'BHD',
      bedrooms = 1,
      bathrooms = 1,
      area,
      location,
      images,
      amenities,
      furnished = 'Furnished',
      agent,
    } = req.body;

    if (!title || !price || !area || !location || !location.city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields: title, price, area, and location.city',
      });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newPropertyData = {
      title,
      slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
      description: description || `Splendid ${propertyType} available for ${category} in ${location.city}.`,
      category,
      propertyType,
      price: Number(price),
      pricePeriod,
      currency,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      area: Number(area),
      location: {
        governorate: location.governorate || 'Capital Governorate',
        city: location.city,
        building: location.building || '',
        address: location.address || `${location.city}, Bahrain`,
      },
      images: images && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: amenities || ['Central A/C', 'Balcony', 'Covered Parking'],
      furnished,
      isVerified: true,
      isFeatured: false,
      isSuperAgent: true,
      agent: agent || {
        name: 'Direct Landlord / Partner',
        phone: '0000000000',
        whatsapp: '0000000000',
        email: 'info@buytora.in',
        company: 'Buytora Verified Network',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
        closedDeals: 15,
      },
      referenceNumber: 'RH-' + Math.floor(100000 + Math.random() * 900000),
    };

    const isConnected = getIsConnected();
    let savedProperty;

    if (isConnected) {
      savedProperty = await Property.create(newPropertyData);
    } else {
      savedProperty = {
        _id: 'mem_' + Date.now(),
        ...newPropertyData,
        createdAt: new Date().toISOString(),
      };
      memoryStore.properties.unshift(savedProperty);
    }

    res.status(201).json({
      success: true,
      message: 'Property listed successfully!',
      data: savedProperty,
    });
  } catch (error) {
    console.error('Error in createProperty:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get admin statistics and overview
// @route   GET /api/properties/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const isConnected = getIsConnected();
    const Inquiry = require('../models/Inquiry');
    const Agent = require('../models/Agent');

    let totalProperties = 0;
    let rentCount = 0;
    let buyCount = 0;
    let commercialCount = 0;
    let verifiedCount = 0;
    let featuredCount = 0;
    let totalInquiries = 0;
    let newInquiries = 0;
    let totalAgents = 0;
    let recentProperties = [];
    let recentInquiries = [];

    if (isConnected) {
      totalProperties = await Property.countDocuments();
      rentCount = await Property.countDocuments({ category: 'rent' });
      buyCount = await Property.countDocuments({ category: 'buy' });
      commercialCount = await Property.countDocuments({ category: 'commercial' });
      verifiedCount = await Property.countDocuments({ isVerified: true });
      featuredCount = await Property.countDocuments({ isFeatured: true });

      totalInquiries = await Inquiry.countDocuments();
      newInquiries = await Inquiry.countDocuments({ status: 'new' });
      totalAgents = await Agent.countDocuments();

      recentProperties = await Property.find().sort({ createdAt: -1 }).limit(5);
      recentInquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(5);
    } else {
      const props = memoryStore.properties;
      totalProperties = props.length;
      rentCount = props.filter((p) => p.category === 'rent').length;
      buyCount = props.filter((p) => p.category === 'buy').length;
      commercialCount = props.filter((p) => p.category === 'commercial').length;
      verifiedCount = props.filter((p) => p.isVerified).length;
      featuredCount = props.filter((p) => p.isFeatured).length;

      const inqs = memoryStore.inquiries;
      totalInquiries = inqs.length;
      newInquiries = inqs.filter((i) => i.status === 'new').length;
      totalAgents = memoryStore.agents.length;

      recentProperties = [...props].slice(0, 5);
      recentInquiries = [...inqs].slice(0, 5);
    }

    res.json({
      success: true,
      data: {
        totalProperties,
        rentCount,
        buyCount,
        commercialCount,
        verifiedCount,
        featuredCount,
        totalInquiries,
        newInquiries,
        totalAgents,
        recentProperties,
        recentInquiries,
        dbStatus: isConnected ? 'Connected (MongoDB)' : 'Resilient Mode (In-Memory)',
      },
    });
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update an existing property
// @route   PUT /api/properties/:id
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const isConnected = getIsConnected();

    if (isConnected) {
      let property;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        property = await Property.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      }
      if (!property) {
        property = await Property.findOneAndUpdate({ referenceNumber: id }, updateData, { new: true });
      }

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      return res.json({ success: true, message: 'Property updated successfully', data: property });
    } else {
      const index = memoryStore.properties.findIndex(
        (p) => String(p._id) === id || p.referenceNumber === id
      );

      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      memoryStore.properties[index] = {
        ...memoryStore.properties[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      return res.json({
        success: true,
        message: 'Property updated successfully (memory store)',
        data: memoryStore.properties[index],
      });
    }
  } catch (error) {
    console.error('Error in updateProperty:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Toggle property status (isVerified, isFeatured)
// @route   PATCH /api/properties/:id/toggle-status
exports.togglePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, isFeatured, isSuperAgent } = req.body;
    const isConnected = getIsConnected();

    const updates = {};
    if (typeof isVerified === 'boolean') updates.isVerified = isVerified;
    if (typeof isFeatured === 'boolean') updates.isFeatured = isFeatured;
    if (typeof isSuperAgent === 'boolean') updates.isSuperAgent = isSuperAgent;

    if (isConnected) {
      let property;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        property = await Property.findByIdAndUpdate(id, { $set: updates }, { new: true });
      }
      if (!property) {
        property = await Property.findOneAndUpdate({ referenceNumber: id }, { $set: updates }, { new: true });
      }
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      return res.json({ success: true, data: property });
    } else {
      const index = memoryStore.properties.findIndex(
        (p) => String(p._id) === id || p.referenceNumber === id
      );
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }
      memoryStore.properties[index] = {
        ...memoryStore.properties[index],
        ...updates,
      };
      return res.json({ success: true, data: memoryStore.properties[index] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const isConnected = getIsConnected();

    if (isConnected) {
      let deleted = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        deleted = await Property.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await Property.findOneAndDelete({ referenceNumber: id });
      }

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      return res.json({ success: true, message: 'Property deleted successfully' });
    } else {
      const initialLength = memoryStore.properties.length;
      memoryStore.properties = memoryStore.properties.filter(
        (p) => String(p._id) !== id && p.referenceNumber !== id
      );

      if (memoryStore.properties.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      return res.json({ success: true, message: 'Property deleted successfully' });
    }
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get explore location counts & statistics
// @route   GET /api/properties/locations/summary
exports.getLocationsSummary = async (req, res) => {
  try {
    const isConnected = getIsConnected();
    let properties = [];

    if (isConnected) {
      properties = await Property.find({}, 'location category propertyType');
    } else {
      properties = memoryStore.properties;
    }

    const summary = {};

    properties.forEach((p) => {
      const gov = p.location?.governorate || 'Other';
      const city = p.location?.city || 'Other';

      if (!summary[gov]) {
        summary[gov] = { total: 0, cities: {} };
      }
      summary[gov].total += 1;

      if (!summary[gov].cities[city]) {
        summary[gov].cities[city] = { total: 0, rent: 0, buy: 0, commercial: 0 };
      }
      summary[gov].cities[city].total += 1;
      if (p.category === 'rent') summary[gov].cities[city].rent += 1;
      if (p.category === 'buy') summary[gov].cities[city].buy += 1;
      if (p.category === 'commercial') summary[gov].cities[city].commercial += 1;
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};



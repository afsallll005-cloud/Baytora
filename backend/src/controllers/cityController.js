const City = require('../models/City');
const { getIsConnected, memoryStore } = require('../config/db');

// @desc    Get all featured cities
// @route   GET /api/featured-cities
exports.getCities = async (req, res) => {
  try {
    const isConnected = getIsConnected();
    const showAll = req.query.all === 'true';

    if (isConnected) {
      const filter = showAll ? {} : { isActive: true };
      const cities = await City.find(filter).sort({ order: 1, createdAt: -1 });
      return res.json({ success: true, count: cities.length, data: cities });
    } else {
      let list = memoryStore.cities || [];
      if (!showAll) {
        list = list.filter((c) => c.isActive !== false);
      }
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      return res.json({ success: true, count: list.length, data: list });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new featured city
// @route   POST /api/featured-cities
exports.createCity = async (req, res) => {
  try {
    const { name, description, image, fallbackImage, href, order, isActive } = req.body;
    if (!name || !description || !image) {
      return res.status(400).json({
        success: false,
        message: 'City name, description, and image URL are required'
      });
    }

    const cityData = {
      name: name.trim(),
      description: description.trim(),
      image: image.trim(),
      fallbackImage: fallbackImage ? fallbackImage.trim() : '',
      href: href && href.trim() ? href.trim() : `/properties?search=${encodeURIComponent(name.trim())}`,
      order: typeof order === 'number' ? order : 1,
      isActive: isActive !== undefined ? !!isActive : true,
    };

    const isConnected = getIsConnected();
    if (isConnected) {
      const newCity = await City.create(cityData);
      return res.status(201).json({ success: true, data: newCity });
    } else {
      const newCity = {
        _id: 'city_' + Date.now(),
        ...cityData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!memoryStore.cities) memoryStore.cities = [];
      memoryStore.cities.push(newCity);
      return res.status(201).json({ success: true, data: newCity });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update featured city
// @route   PUT /api/featured-cities/:id
exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const isConnected = getIsConnected();

    if (isConnected) {
      const city = await City.findByIdAndUpdate(id, updateData, { new: true });
      if (!city) return res.status(404).json({ success: false, message: 'City not found' });
      return res.json({ success: true, data: city });
    } else {
      if (!memoryStore.cities) memoryStore.cities = [];
      const index = memoryStore.cities.findIndex((c) => String(c._id) === String(id));
      if (index === -1) return res.status(404).json({ success: false, message: 'City not found' });
      memoryStore.cities[index] = {
        ...memoryStore.cities[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      return res.json({ success: true, data: memoryStore.cities[index] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete featured city
// @route   DELETE /api/featured-cities/:id
exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const isConnected = getIsConnected();

    if (isConnected) {
      const deleted = await City.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'City not found' });
      return res.json({ success: true, message: 'City deleted successfully' });
    } else {
      if (!memoryStore.cities) memoryStore.cities = [];
      const initLen = memoryStore.cities.length;
      memoryStore.cities = memoryStore.cities.filter((c) => String(c._id) !== String(id));
      if (memoryStore.cities.length === initLen) {
        return res.status(404).json({ success: false, message: 'City not found' });
      }
      return res.json({ success: true, message: 'City deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

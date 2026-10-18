const mongoose = require('mongoose');
const { seedProperties, seedAgents, seedCities } = require('../data/seedData');

let isConnected = false;
let memoryStore = {
  properties: JSON.parse(JSON.stringify(seedProperties)),
  agents: JSON.parse(JSON.stringify(seedAgents)),
  cities: JSON.parse(JSON.stringify(seedCities || [])),
  inquiries: []
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rentel_home';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });

    isConnected = true;
    console.log(`✓ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Auto seed if empty
    const Property = require('../models/Property');
    const Agent = require('../models/Agent');
    const City = require('../models/City');

    const propertyCount = await Property.countDocuments();
    if (propertyCount === 0) {
      console.log('Seeding initial properties into MongoDB...');
      await Property.insertMany(seedProperties);
      console.log(`✓ Seeded ${seedProperties.length} properties into MongoDB`);
    }

    const agentCount = await Agent.countDocuments();
    if (agentCount === 0) {
      await Agent.insertMany(seedAgents);
      console.log(`✓ Seeded ${seedAgents.length} agents into MongoDB`);
    }

    const cityCount = await City.countDocuments();
    if (cityCount === 0 && seedCities && seedCities.length > 0) {
      await City.insertMany(seedCities);
      console.log(`✓ Seeded ${seedCities.length} featured cities into MongoDB`);
    }

    return conn;
  } catch (error) {
    isConnected = false;
    console.warn(`! MongoDB Connection Notice: Could not connect to MongoDB at ${uri}.`);
    console.log(`✓ Resilient mode active: Using robust in-memory database with ${memoryStore.properties.length} seeded properties.`);
    console.log(`  (To connect your local/Atlas MongoDB, update MONGODB_URI in backend/.env)`);
    return null;
  }
};

const getDBStatus = () => ({
  isMongoConnected: isConnected,
  mode: isConnected ? 'MongoDB Database' : 'Resilient Memory Database',
  propertiesCount: isConnected ? null : memoryStore.properties.length,
});

module.exports = {
  connectDB,
  getIsConnected: () => isConnected,
  getDBStatus,
  memoryStore,
};

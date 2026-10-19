require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');
const Agent = require('./models/Agent');
const User = require('./models/User');
const City = require('./models/City');
const { seedProperties, seedAgents, seedUsers, seedCities } = require('./data/seedData');

async function runSeed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rentel_home';
  console.log(`Connecting to MongoDB at ${uri}...`);

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    console.log('Clearing old properties, agents, users, and cities...');
    await Property.deleteMany({});
    await Agent.deleteMany({});
    await User.deleteMany({});
    await City.deleteMany({});

    console.log('Inserting seed properties...');
    await Property.insertMany(seedProperties);
    console.log(`✓ Seeded ${seedProperties.length} properties.`);

    console.log('Inserting seed agents...');
    await Agent.insertMany(seedAgents);
    console.log(`✓ Seeded ${seedAgents.length} agents.`);

    console.log('Inserting seed users...');
    await User.insertMany(seedUsers);
    console.log(`✓ Seeded ${seedUsers.length} users (including Admin@Buytora).`);

    console.log('Inserting seed cities...');
    await City.insertMany(seedCities);
    console.log(`✓ Seeded ${seedCities.length} featured cities.`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

runSeed();

const path = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });
}
const mongoose = require('mongoose');
const initData = require('./data.js');
const listing = require('../models/listing.js');
const MONGO_URL = process.env.MONGODB_URI || process.env.ATLASDB_URL || process.env.ALTLASDB_URL;


if (!MONGO_URL || typeof MONGO_URL !== 'string') {
  console.error('Missing MongoDB URI. Set MONGODB_URI in backend/.env or in your environment.');
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

const initDB = async () => {
  await listing.deleteMany({});
  const seedData = initData.data.map((obj) => ({ ...obj, owner: '6893c7dd3eb080083ebae42e' }));
  await listing.insertMany(seedData);
  console.log('Data initialization complete');
  await mongoose.disconnect();
};

main()
  .then(initDB)
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
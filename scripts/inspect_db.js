const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function check() {
  console.log('Connecting to Mongo URI:', process.env.MONGO_URI ? 'URI present' : 'URI missing');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected successfully!');
  
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Found collections:', collections.map(c => c.name));

  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    const doc = await db.collection(col.name).findOne();
    console.log(`- ${col.name}: ${count} documents`);
    if (doc) {
      console.log(`  Sample:`, JSON.stringify(doc).slice(0, 150));
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

check().catch(err => {
  console.error('Error during check:', err);
  process.exit(1);
});

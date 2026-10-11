const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  const hashed = await bcrypt.hash('password123', 10);
  const res = await User.updateOne(
    { email: { $regex: /^alex\.johnson@mindtwin\.ai$/i } },
    { $set: { password: hashed } }
  );
  console.log('Updated Alex Johnson password result:', res);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config({ path: 'C:/Users/ujjwa/Downloads/MindTwinAI/backend/.env' });
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const hashed = await bcrypt.hash('password123', 10);
  const res = await User.updateMany({}, { $set: { password: hashed } });
  console.log('Successfully updated users with hashed password123. Modified count:', res.modifiedCount);
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });

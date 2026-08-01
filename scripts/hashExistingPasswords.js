const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // adjust path to your actual User model
require('dotenv').config();

async function hashPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        console.log(`Skipping ${user.email}, already hashed`);
        continue;
      }

      const hashed = await bcrypt.hash(user.password, 10);
      user.password = hashed;
      await user.save();
      console.log(`Hashed password for ${user.email}`);
    }

    console.log("Done!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

hashPasswords();
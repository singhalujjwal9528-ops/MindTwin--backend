// backend/scripts/resetOneUserPassword.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const newPlainPassword = "Test@123"; // pick any password you'll remember
    const hashed = await bcrypt.hash(newPlainPassword, 10);

    const result = await User.updateOne(
      { email: "rayaan_sehgal658@gmail.com" },
      { $set: { password: hashed } }
    );

    console.log("Update result:", result);
    console.log("New plain password to use in Postman:", newPlainPassword);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

resetPassword();
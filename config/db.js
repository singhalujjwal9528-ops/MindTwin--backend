const dns = require('dns');
// Ensure reliable SRV lookup on Windows routers
dns.setServers(['8.8.8.8', '1.1.1.1']);


const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
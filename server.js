const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require("./routes/activityRoutes");
const heartRoutes = require("./routes/heartRoutes");
const sleepRoutes = require("./routes/sleepRoutes");
const screenRoutes = require("./routes/screenRoutes");
const moodRoutes = require("./routes/moodRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/heart", heartRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/screen", screenRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/insights", insightsRoutes);
app.get("/", (req, res) => {
  res.send("MindTwin AI Backend Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
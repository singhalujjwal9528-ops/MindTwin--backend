const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");
const heartRoutes = require("./routes/heartRoutes");
const sleepRoutes = require("./routes/sleepRoutes");
const screenRoutes = require("./routes/screenRoutes");
const moodRoutes = require("./routes/moodRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const insightsRoutes = require("./routes/insightsRoutes");

connectDB();

const app = express();

// Configure CORS for frontend access (Vite default port 5173, preview port 4173, etc.)
app.use(cors({
  origin: true, // Allow any incoming origin dynamically
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json());

// Request logging middleware for transparency
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/heart", heartRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/screen", screenRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/insights", insightsRoutes);

// Health check and root endpoints
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "MindTwin AI Backend", timestamp: new Date() });
});

app.get("/", (req, res) => {
  res.send("MindTwin AI Backend Running...");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`MindTwin AI Backend running on port ${PORT}`);
  console.log(`Ready for frontend requests at http://localhost:${PORT}`);
});
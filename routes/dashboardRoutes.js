const express = require("express");
const router = express.Router();

const {
    getDashboardData
} = require("../controllers/dashboardController");

// Get dashboard data for a user
router.get("/:userId", getDashboardData);

module.exports = router;
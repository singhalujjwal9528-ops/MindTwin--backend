const express = require("express");
const router = express.Router();

const {
    getInsights
} = require("../controllers/insightsController");

router.get("/:userId", getInsights);

module.exports = router;
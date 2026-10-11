const express = require("express");
const router = express.Router();

const {
    getUserMood,
    addMood,
    getMoodForecast
} = require("../controllers/moodController");

router.get("/forecast/:userId", getMoodForecast);
router.get("/:userId", getUserMood);
router.post("/", addMood);

module.exports = router;
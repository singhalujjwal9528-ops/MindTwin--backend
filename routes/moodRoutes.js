const express = require("express");
const router = express.Router();

const {
    getUserMood,
    addMood
} = require("../controllers/moodController");

router.get("/:userId", getUserMood);
router.post("/", addMood);

module.exports = router;
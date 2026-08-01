const express = require("express");
const router = express.Router();

const {
    getUserHeart
} = require("../controllers/heartController");

router.get("/:userId", getUserHeart);

module.exports = router;
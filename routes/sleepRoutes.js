const express = require("express");
const router = express.Router();

const {
    getUserSleep
} = require("../controllers/sleepController");

router.get("/:userId", getUserSleep);

module.exports = router;
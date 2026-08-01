const express = require("express");
const router = express.Router();

const {
    getUserScreen
} = require("../controllers/screenController");

router.get("/:userId", getUserScreen);

module.exports = router;
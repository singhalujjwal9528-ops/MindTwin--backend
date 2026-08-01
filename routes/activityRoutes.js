const express = require("express");
const router = express.Router();

const {
    getUserActivity
} = require("../controllers/activityController");

router.get("/:userId", getUserActivity);

module.exports = router;
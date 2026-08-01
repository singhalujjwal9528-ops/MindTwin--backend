const User = require("../models/User");
const Activity = require("../models/Activity");
const Heart = require("../models/Heart");
const Sleep = require("../models/Sleep");
const PhoneUsage = require("../models/PhoneUsage");
const Mood = require("../models/Mood");

const getDashboardData = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne({ user_id: Number(userId) });

        const activity = await Activity.findOne({
            user_id: Number(userId)
        }).sort({ timestamp: -1 });

        const heart = await Heart.findOne({
            user_id: Number(userId)
        }).sort({ timestamp: -1 });

        const sleep = await Sleep.findOne({
            user_id: Number(userId)
        }).sort({ sleep_start: -1 });

        const screen = await PhoneUsage.findOne({
            user_id: Number(userId)
        }).sort({ timestamp: -1 });

        const mood = await Mood.findOne({
            user_id: Number(userId)
        }).sort({ timestamp: -1 });

        res.status(200).json({
            profile: user,
            activity,
            heart,
            sleep,
            screen,
            mood
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getDashboardData
};
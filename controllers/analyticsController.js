const Activity = require("../models/Activity");
const Heart = require("../models/Heart");
const Sleep = require("../models/Sleep");
const PhoneUsage = require("../models/PhoneUsage");
const Mood = require("../models/Mood");

const getAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch all records for the user
        const activities = await Activity.find({ user_id: Number(userId) });
        const hearts = await Heart.find({ user_id: Number(userId) });
        const sleeps = await Sleep.find({ user_id: Number(userId) });
        const screens = await PhoneUsage.find({ user_id: Number(userId) });
        const moods = await Mood.find({ user_id: Number(userId) });

        // Calculate averages
        const averageSteps =
            activities.length > 0
                ? activities.reduce((sum, item) => sum + item.steps, 0) / activities.length
                : 0;

        const averageHeartRate =
            hearts.length > 0
                ? hearts.reduce((sum, item) => sum + item.heart_rate, 0) / hearts.length
                : 0;

        const averageSleep =
            sleeps.length > 0
                ? sleeps.reduce((sum, item) => sum + item.total_sleep, 0) / sleeps.length
                : 0;

        const averageScreenTime =
            screens.length > 0
                ? screens.reduce((sum, item) => sum + item.screen_time, 0) / screens.length
                : 0;

        const averageMood =
            moods.length > 0
                ? moods.reduce((sum, item) => sum + item.mood_rating, 0) / moods.length
                : 0;

        res.status(200).json({
            averageSteps: Number(averageSteps.toFixed(2)),
            averageHeartRate: Number(averageHeartRate.toFixed(2)),
            averageSleep: Number(averageSleep.toFixed(2)),
            averageScreenTime: Number(averageScreenTime.toFixed(2)),
            averageMood: Number(averageMood.toFixed(2))
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getAnalytics
};
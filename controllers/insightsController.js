const Activity = require("../models/Activity");
const Heart = require("../models/Heart");
const Sleep = require("../models/Sleep");
const PhoneUsage = require("../models/PhoneUsage");
const Mood = require("../models/Mood");

const getInsights = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch latest records
        const activity = await Activity.findOne({ user_id: Number(userId) }).sort({ timestamp: -1 });
        const heart = await Heart.findOne({ user_id: Number(userId) }).sort({ timestamp: -1 });
        const sleep = await Sleep.findOne({ user_id: Number(userId) }).sort({ sleep_start: -1 });
        const screen = await PhoneUsage.findOne({ user_id: Number(userId) }).sort({ timestamp: -1 });
        const mood = await Mood.findOne({ user_id: Number(userId) }).sort({ timestamp: -1 });

        let healthScore = 100;
        let insights = [];
        let recommendations = [];

        // Sleep Analysis
        if (sleep && sleep.total_sleep < 7) {
            healthScore -= 15;
            insights.push("Your sleep duration is below the recommended 7-8 hours.");
            recommendations.push("Aim for at least 7-8 hours of sleep each night.");
        }

        // Screen Time Analysis
        if (screen && screen.screen_time > 300) {
            healthScore -= 10;
            insights.push("Your screen time is higher than recommended.");
            recommendations.push("Reduce screen time, especially before bedtime.");
        }

        // Activity Analysis
        if (activity && activity.steps < 5000) {
            healthScore -= 15;
            insights.push("Your daily step count is low.");
            recommendations.push("Try walking at least 8,000 steps per day.");
        }

        // Heart Rate Analysis
        if (heart && (heart.heart_rate > 100 || heart.heart_rate < 60)) {
            healthScore -= 20;
            insights.push("Your heart rate is outside the normal resting range.");
            recommendations.push("Consult a healthcare professional if this persists.");
        }

        // Mood Analysis
        if (mood && mood.mood_rating <= 2) {
            healthScore -= 10;
            insights.push("Your recent mood ratings indicate possible stress.");
            recommendations.push("Practice relaxation techniques or talk to someone you trust.");
        }

        let riskLevel = "Low";

        if (healthScore < 80) riskLevel = "Medium";
        if (healthScore < 60) riskLevel = "High";
        if (healthScore < 40) riskLevel = "Critical";

        if (insights.length === 0) {
            insights.push("Great job! Your health metrics look good.");
            recommendations.push("Continue maintaining your healthy lifestyle.");
        }

        res.status(200).json({
            healthScore,
            riskLevel,
            insights,
            recommendations
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getInsights
};
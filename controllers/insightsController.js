const Activity = require("../models/Activity");
const Heart = require("../models/Heart");
const Sleep = require("../models/Sleep");
const PhoneUsage = require("../models/PhoneUsage");
const Mood = require("../models/Mood");
const { getMoodPrediction } = require("../services/predictionService");

const getInsights = async (req, res) => {
  try {
    const { userId } = req.params;
    const numUserId = Number(userId) || 1;

    // 1. Fetch latest telemetry records for biomarker scores
    const [activity, heart, sleep, screen, mood] = await Promise.all([
      Activity.findOne({ user_id: numUserId }).sort({ timestamp: -1 }),
      Heart.findOne({ user_id: numUserId }).sort({ timestamp: -1 }),
      Sleep.findOne({ user_id: numUserId }).sort({ sleep_start: -1 }),
      PhoneUsage.findOne({ user_id: numUserId }).sort({ timestamp: -1 }),
      Mood.findOne({ user_id: numUserId }).sort({ timestamp: -1 })
    ]);

    // 2. Compute dynamic circadian health score
    let healthScore = 88;
    const recommendations = [];

    const sleepHours = sleep ? (sleep.total_sleep_hours || sleep.total_sleep || 7.5) : 7.5;
    if (sleepHours < 7.0) {
      healthScore -= 8;
      recommendations.push("Sleep duration fell below 7 hours. Prioritize an earlier bedtime.");
    } else {
      recommendations.push("Maintain your 10:30 PM wind-down routine to support consistent REM restoration.");
    }

    const screenTime = screen ? screen.screen_time : 180;
    if (screenTime > 240) {
      healthScore -= 7;
      recommendations.push("Activate display grayscale or blue-light filter after 9:00 PM to lessen retinal stimulation.");
    }

    const hr = heart ? heart.heart_rate : 68;
    if (hr > 85) {
      healthScore -= 10;
      recommendations.push("Resting heart rate is elevated. Consider light stretching or hydration.");
    } else {
      recommendations.push("Your cardiovascular recovery indicates ready adaptation for moderate aerobic activity.");
    }

    recommendations.push("Aim for 10–15 minutes of outdoor natural light within 30 minutes of waking.");

    let riskLevel = "Optimal Range";
    if (healthScore < 80) riskLevel = "Action Recommended";
    if (healthScore < 65) riskLevel = "High Attention";

    // 3. Obtain ML Mood Forecast & Permutation Importance Insights
    const predictionResult = await getMoodPrediction(numUserId);

    res.status(200).json({
      success: true,
      userId: numUserId,
      healthScore: Math.max(50, Math.min(100, healthScore)),
      riskLevel,
      forecast: predictionResult.forecast,
      insights: predictionResult.insights,
      recommendations
    });

  } catch (error) {
    console.error("Insights controller error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getInsights
};
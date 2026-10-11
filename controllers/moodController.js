const Mood = require("../models/Mood");
const { getMoodPrediction } = require("../services/predictionService");

// Get mood history for a user
const getUserMood = async (req, res) => {
  try {
    const { userId } = req.params;
    const numUserId = Number(userId) || 1;

    const moodData = await Mood.find({
      user_id: numUserId
    }).sort({ timestamp: -1 }).limit(30);

    res.status(200).json(moodData);

  } catch (error) {
    console.error("Get mood error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

// Add a new mood entry
const addMood = async (req, res) => {
  try {
    const { user_id, mood_rating, tag, notes } = req.body;

    if (!user_id || mood_rating === undefined) {
      return res.status(400).json({ message: "user_id and mood_rating are required" });
    }

    const mood = new Mood({
      user_id: Number(user_id),
      mood_rating: Number(mood_rating),
      tag: tag || null,
      notes: notes || null,
      timestamp: new Date()
    });

    await mood.save();

    res.status(201).json({
      message: "Mood logged successfully",
      mood
    });

  } catch (error) {
    console.error("Add mood error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

// Next-day mood forecast from HistGradientBoostingRegressor ML model
const getMoodForecast = async (req, res) => {
  try {
    const { userId } = req.params;
    const numUserId = Number(userId) || 1;

    const prediction = await getMoodPrediction(numUserId);
    res.status(200).json(prediction);

  } catch (error) {
    console.error("Get mood forecast error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getUserMood,
  addMood,
  getMoodForecast
};
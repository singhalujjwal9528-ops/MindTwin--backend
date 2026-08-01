const Mood = require("../models/Mood");

// Get mood history for a user
const getUserMood = async (req, res) => {
    try {
        const { userId } = req.params;

        const moodData = await Mood.find({
            user_id: Number(userId)
        }).sort({ timestamp: -1 });

        if (moodData.length === 0) {
            return res.status(404).json({
                message: "No mood data found for this user."
            });
        }

        res.status(200).json(moodData);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Add a new mood entry
const addMood = async (req, res) => {
    try {
        const { user_id, mood_rating } = req.body;

        const mood = new Mood({
            user_id,
            mood_rating,
            timestamp: new Date()
        });

        await mood.save();

        res.status(201).json({
            message: "Mood added successfully",
            mood
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getUserMood,
    addMood
};
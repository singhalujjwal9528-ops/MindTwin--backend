const PhoneUsage = require("../models/PhoneUsage");

// Get screen usage data by user ID
const getUserScreen = async (req, res) => {
    try {
        const { userId } = req.params;

        const screenData = await PhoneUsage.find({
            user_id: Number(userId)
        }).sort({ timestamp: -1 });

        if (screenData.length === 0) {
            return res.status(404).json({
                message: "No screen usage data found for this user."
            });
        }

        res.status(200).json(screenData);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getUserScreen
};
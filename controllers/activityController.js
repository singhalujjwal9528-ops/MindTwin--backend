const Activity = require("../models/Activity");

// Get activity by user ID
const getUserActivity = async (req, res) => {
    try {
        const { userId } = req.params;

        const activity = await Activity.find({
            user_id: Number(userId)
        }).sort({ timestamp: -1 });

        if (activity.length === 0) {
            return res.status(404).json({
                message: "No activity found for this user."
            });
        }

        res.status(200).json(activity);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getUserActivity
};
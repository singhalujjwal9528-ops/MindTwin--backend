const Sleep = require("../models/Sleep");

// Get sleep data by user ID
const getUserSleep = async (req, res) => {
    try {
        const { userId } = req.params;

        const sleepData = await Sleep.find({
            user_id: Number(userId)
        }).sort({ sleep_start: -1 });

        if (sleepData.length === 0) {
            return res.status(404).json({
                message: "No sleep data found for this user."
            });
        }

        res.status(200).json(sleepData);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getUserSleep
};
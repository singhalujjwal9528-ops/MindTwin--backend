const Heart = require("../models/Heart");

// Get heart data by user ID
const getUserHeart = async (req, res) => {
    try {
        const { userId } = req.params;

        const heartData = await Heart.find({
            user_id: Number(userId)
        }).sort({ timestamp: -1 });

        if (heartData.length === 0) {
            return res.status(404).json({
                message: "No heart data found for this user."
            });
        }

        res.status(200).json(heartData);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getUserHeart
};
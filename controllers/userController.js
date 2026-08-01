const User = require("../models/User");

const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({ user_id: id }); // adjust if your schema uses a different field

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userSafe = { ...user._doc };
        delete userSafe.password;

        res.json(userSafe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile };
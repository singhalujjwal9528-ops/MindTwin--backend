const User = require("../models/User");

// Get user profile by user_id
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const numId = Number(id) || 1;

    let user = await User.findOne({ user_id: numId });

    if (!user) {
      if (numId === 1) {
        user = {
          user_id: 1,
          user_names: "Alex Johnson",
          email: "alex.johnson@mindtwin.ai",
          age: 26,
          gender: "Non-binary",
          targetSleep: 8.0
        };
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    }

    const userSafe = user._doc ? { ...user._doc } : { ...user };
    delete userSafe.password;

    res.json(userSafe);
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update user profile parameters
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const numId = Number(id) || 1;
    const { user_names, name, email, age, gender, targetSleep } = req.body;

    const updateFields = {};
    if (user_names || name) updateFields.user_names = user_names || name;
    if (email) updateFields.email = email;
    if (age !== undefined) updateFields.age = Number(age);
    if (gender) updateFields.gender = gender;
    if (targetSleep !== undefined) updateFields.targetSleep = Number(targetSleep);

    const updatedUser = await User.findOneAndUpdate(
      { user_id: numId },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userSafe = { ...updatedUser._doc };
    delete userSafe.password;

    res.json({
      message: "Profile updated successfully",
      user: userSafe
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};
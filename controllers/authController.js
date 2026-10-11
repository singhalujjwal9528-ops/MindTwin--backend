const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const trimmedEmail = email.trim();
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${trimmedEmail}$`, "i") }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email },
      process.env.JWT_SECRET || "mindtwin_secret",
      { expiresIn: "7d" }
    );

    const userSafe = user._doc ? { ...user._doc } : { ...user };
    delete userSafe.password;

    res.status(200).json({
      token,
      user: userSafe
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login };
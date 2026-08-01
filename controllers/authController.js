const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("=== LOGIN ATTEMPT ===");
        console.log("Email received:", email);
        console.log("Password received:", password);

        const user = await User.findOne({ email: email });
        console.log("User found in DB:", user);

        if (!user) {
            console.log("❌ No user found with this email");
            return res.status(401).json({ message: "Invalid Email or Password" });
        }

        console.log("Stored password hash:", user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match result:", isMatch);

        if (!isMatch) {
            console.log("❌ Password did not match");
            return res.status(401).json({ message: "Invalid Email or Password" });
        }

        const token = jwt.sign(
            { id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, user });

    } catch (error) {
        console.log("❌ ERROR:", error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login };
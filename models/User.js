const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    user_id: Number,
    user_names: String,
    email: String,
    password: String,
    age: Number,
    gender: String,
    targetSleep: { type: Number, default: 8.0 }
},
{
    collection: "users"
}
);

module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    user_id: Number,
    user_names: String,
    email: String,
    password: String,
    age: Number,
    gender: String
},
{
    collection: "users"
}
);

module.exports = mongoose.model("User", userSchema);
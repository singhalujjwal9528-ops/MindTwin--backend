const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
{
    user_id: Number,
    timestamp: Date,
    mood_rating: Number
},
{
    collection: "mood"
}
);

module.exports = mongoose.model("Mood", moodSchema);
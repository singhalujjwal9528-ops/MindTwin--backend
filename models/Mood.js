const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
{
    user_id: Number,
    timestamp: {
        type: Date,
        default: Date.now
    },
    mood_rating: Number,
    tag: {
        type: String,
        trim: true,
        default: null
    },
    notes: {
        type: String,
        default: null
    }
},
{
    collection: "mood"
}
);

module.exports = mongoose.model("Mood", moodSchema);
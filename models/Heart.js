const mongoose = require("mongoose");

const heartSchema = new mongoose.Schema(
{
    user_id: Number,
    timestamp: Date,
    heart_rate: Number,
    max_heart: Number,
    min_heart: Number,
    heart_rate_variability: Number
},
{
    collection: "heart"
}
);

module.exports = mongoose.model("Heart", heartSchema);
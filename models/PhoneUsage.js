const mongoose = require("mongoose");

const phoneUsageSchema = new mongoose.Schema(
{
    usage_id: Number,
    user_id: Number,
    timestamp: Date,
    screen_time: Number,
    app_usage_time: Number
},
{
    collection: "screen"
}
);

module.exports = mongoose.model("PhoneUsage", phoneUsageSchema);
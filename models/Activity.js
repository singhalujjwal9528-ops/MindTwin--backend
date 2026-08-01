const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
{
    activity_id: Number,
    user_id: Number,
    timestamp: Date,
    steps: Number,
    calories: Number,
    distance: Number
},
{
    collection: "activity"
}
);

module.exports = mongoose.model("Activity", activitySchema);
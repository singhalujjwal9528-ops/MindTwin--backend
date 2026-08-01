const mongoose = require("mongoose");

const sleepSchema = new mongoose.Schema(
{
    user_id: Number,
    sleep_start: Date,
    sleep_end: Date,
    total_sleep: Number,
    sleep_efficiency: Number,
    movement: Number,
    sleep_rating: Number
},
{
    collection: "sleep"
}
);

module.exports = mongoose.model("Sleep", sleepSchema);
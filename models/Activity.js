const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ActivitySchema = Schema({
  name: { type: String, required: true },
  description: String,
  placeId: { type: Schema.Types.ObjectId, ref: "Poi" }, // SYGIC TRAVEL API
  date: { type: Date, required: true },
  color: { type: String }
});

ActivitySchema.set("timestamps", true);

const Activity = mongoose.model("Activity", ActivitySchema);

module.exports = Activity;

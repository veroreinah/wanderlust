const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ActivitySchema = Schema({
  name: { type: String, required: true },
  description: String,
  placeId: { type: String, required: true }, // Google API
  dateStart: { type: Date, required: true},
  dateEnd: { type: Date, required: true},
  color: { type: String }
});

ActivitySchema.set("timestamps", true);

const Activity = mongoose.model("Activity", ActivitySchema);

module.exports = Activity;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TripSchema = Schema({
  name: { type: String, required: true },
  description: String,
  userID: { type: Schema.Types.ObjectId, ref: "User" },
  dateStart: { type: Date, required: true},
  dateEnd: { type: Date, required: true},
  multiDestination: { type: Boolean, default: false },
  destinations: [],
  plans: [ { type: Schema.Types.ObjectId, ref: "Plan" } ],
  tripPicPath: { type: String, required: true },
  tripPicName: { type: String, required: true },
});
TripSchema.set("timestamps", true);

const Trip = mongoose.model("Trip", TripSchema);

module.exports = Trip;

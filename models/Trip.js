const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TripSchema = Schema({
  name: { type: String, required: true },
  description: String,
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  multiDestination: { type: Boolean, default: false },
  public: { type: Boolean, default: false },
  destinations: [],
  activities: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
  tripPicName: { type: String, default: "/images/trip.jpg" }
});
TripSchema.set("timestamps", true);

const Trip = mongoose.model("Trip", TripSchema);

module.exports = Trip;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CitySchema = Schema({
  sygicId: String,
  name: String,
  countrySygicId: String,
  countryId: { type: Schema.Types.ObjectId, ref: "Country" },
  pois: []
});
CitySchema.set("timestamps", true);

const City = mongoose.model("City", CitySchema);

module.exports = City;

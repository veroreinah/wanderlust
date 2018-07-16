const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CitySchema = Schema({
  sygicId: String,
  name: String,
  countryId: String,
  pois: []
});
CitySchema.set("timestamps", true);

const City = mongoose.model("City", CitySchema);

module.exports = City;

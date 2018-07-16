const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CountrySchema = Schema({
  sygicId: String,
  name: String,
  pois: []
});
CountrySchema.set("timestamps", true);

const Country = mongoose.model("Country", CountrySchema);

module.exports = Country;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PoiSchema = Schema({
  name: String,
  name_suffix: String,
  sygicId: { type: String, unique: true },
  location: { type: { type: String }, coordinates: [Number] },
  url: String,
  marker: String,
  categories: [],
  description: String,
  thumbnail_url: String
});

PoiSchema.set("timestamps", true);

const Poi = mongoose.model("Poi", PoiSchema);

module.exports = Poi;

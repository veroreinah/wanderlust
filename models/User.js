const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicPath: { type: String, required: true },
  profilePicName: { type: String, required: true }
});
UserSchema.set("timestamps", true);

const User = mongoose.model("User", UserSchema);

module.exports = User;

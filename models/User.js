const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicName: { type: String, default: "/images/avatar.png" },
  active: { type: Boolean, default: false },
  confirmationCode: String
});
UserSchema.set("timestamps", true);

const User = mongoose.model("User", UserSchema);

module.exports = User;

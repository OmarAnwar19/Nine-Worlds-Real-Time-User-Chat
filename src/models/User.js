const mongoose = require("mongoose");

//a schema is kind of like a blueprint of how new objects in the db are to be created
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});

//then, we have to make an object, which takes in n parameters
//the first 3 are "single_name", schema, "plural_name"
const User = mongoose.model("User", UserSchema, "users");

module.exports = User;

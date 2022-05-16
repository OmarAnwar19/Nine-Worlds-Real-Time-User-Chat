const dotenv = require("dotenv").config();

//we use dotenv to get values from .env file for user, password, and collection
//this keeps these sensitive values safe
const keys = {
  MongoURI: `mongodb+srv://${process.env.MONGONAME}:${process.env.MONGOPASS}@cluster0.4nypy.mongodb.net/${process.env.MONGOCOLL}?retryWrites=true&w=majority`,
};

module.exports = keys;

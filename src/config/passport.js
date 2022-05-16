//this file is basically middleware for authentication with passport
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//importing our user schema so we can get users from the db
const User = require("../models/User");

//the function to authenticate users, takes in passport from app.js
const fnPassport = (passport) => {
  //first, use passport to autenticate
  passport.use(
    //first, we create a new authentication method, localstrategy, which
    //authenticates users based on a field, which we pass in email for
    //this takes in email, password, and done, to indicate that auth is complete
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      //first thing we have to do is check if a user with the email actually exists
      User.findOne({ email: email })
        //then, we have to verify if it found a user
        .then((user) => {
          //so, if no user is found, return done() to move on
          //and return that the user was not found
          if (!user) {
            //return the done object, error=null, user=false, msg=error_msg
            return done(null, false, {
              message: "Email is not registered.",
            });
          }

          //if a user was found, we then have to check if the password
          //which was passed in matches the un-hashed one in the database
          //returns a callback with error, and match

          //so, we verified that the user entered a valid email, now we have to
          //check if they entered a correct password for that user
          //NOTE: the user entered an un-hashed password, which we saved into the
          //database hashed. Therefore, we use bcrypt to un-hash the saved password,
          //and comapre it to what the user entered

          bcrypt.compare(password, user.password, (err, isMatch) => {
            //if there is an error, throw the error
            if (err) throw err;

            //however, if there is a match
            if (isMatch) {
              //return the done object, with null for error, and the user
              return done(null, user);
              //otherwise, if the password does not match
            } else {
              //return null error, false user, and an error message
              return done(null, false, { message: "Incorrect password." });
            }
          });
        })
        //if an error is returned, output it to the console
        .catch((err) => console.log(err));
    })
  );

  // function to save the user id into our session, so we can deserialize the user later
  passport.serializeUser(function (user, done) {
    //return the done object, null error, user=user
    done(null, user);
  });

  //function to deserialize user, and get the info we serialized with passport
  passport.deserializeUser(function (user, done) {
    //return the done object, null error, user=user
    done(null, user);
  });
};

//lastly, we have to export the function
module.exports = fnPassport;

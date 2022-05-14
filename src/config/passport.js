const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//IMPORT OUR USER MODEL SO WE CAN CHECK USERS IN DATABASE
const User = require("../models/User");

module.exports = function (passport) {
  //we pass in passport from our app.js, and use it here
  passport.use(
    //we use our local strategy, by searching for the a user with the same email
    //this returns our user, which is really just an object with email, password,
    //and a third property, done
    //--> done is what we return when we are done our validation
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      //FIND THE USER WITH THE INPUTTED EMAIL
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Email is not registered." });
          }

          //so, we verified that the user entered a valid email, now we have to
          //check if they entered a correct password for that user
          //NOTE: the user entered an un-hashed password, which we saved into the
          //database hashed. Therefore, we use bcrypt to un-hash the saved password,
          //and comapre it to what the user entered

          //we compare the inputted password, with the saved, hashed password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            //if the passwords match
            if (isMatch) {
              return done(null, user);
            } else {
              //if it doesnt match
              return done(null, false, { message: "Incorrect password." });
            }
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
  );

  // function to save the user id into our session, so we can deserialize the user later
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  //function to deserialize user, and get the info we serialized with passport
  passport.deserializeUser((id, done) => {
    //finds the user by id
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};

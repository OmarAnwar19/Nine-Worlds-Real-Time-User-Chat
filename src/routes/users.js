const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

//importing our user schema so we can creat new users and add them to db
const User = require("../models/User");

//router for users/login, render the login ejs view
router.get("/login", (req, res) => res.render("login"));

//router for users/register, render the register ejs view
router.get("/register", (req, res) => res.render("register"));

//post request for user register handler
router.post("/register", (req, res) => {
  //we can destructure our request, to put all of the inputs into variables
  const { name, email, password, password2 } = req.body;

  //this errors array will be added to each time that an error occurs,
  //at the end, we will check if its empty, if so, then validation successful
  let errors = [];

  //check required fields are filled in
  //can also make fields required in html, but in normal registerations,
  //they ususally do it like this
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in empty fields." });
  }

  //CHECK IF PASSWORDS MATCH
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match." });
  }

  //check that the password length is 8+ characters
  if (password.length < 8) {
    errors.push({ msg: "Password should be at least 8 characters" });
  }

  //if our errors array is any longer than 0 (there are any errors)
  if (errors.length > 0) {
    //keep the values that we had, and re-render them out, but ask for user to retry
    res.render("register", {
      //first, pass in our errors array
      errors,
      //next, pass in all of our variables, so they arent cleared on form submit
      //if we make the default value of the form these variables, they will be
      //saved on reload
      name,
      email,
      password,
      password2,
    });
    //otherwise, if there are no errors, validation passed, so add user
  } else {
    //IF THE VALIDATION PASSES
    //first, search for a user with the same email in the databse, we have to make sure it doesnt exist
    User.findOne({ email: email })
      //returns a promise, with the user object
      .then((user) => {
        //if a user is found, then they can not register with that email
        if (user) {
          //add a new error to our errors array
          errors.push({ msg: "Email is already registered" });
          //re-render the register page, with the user inputs saved, and the new error rendered
          res.render("register", {
            errors,
            name,
            email,
            password,
            password2,
          });
          //otherwise, if no user was found, we have to create one
        } else {
          //use our user schema to create a new user, passing in all of the values they entered in the form
          //this is not saved to the db quite yet
          const newUser = new User({
            name,
            email,
            password,
          });

          //to keep our password safe, we have to hash it
          //we cant save a password to db unhashed, so hash the password
          //first, generate a salt to hash the passowrd
          bcrypt.genSalt(10, (err, salt) => {
            //gen salt returns a salt, then, we have to hash, which takes in:
            //password and salt, and returns a callback function with err and hashed pass
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              //if there was an error, then throw the error
              if (err) throw err;

              //otherwise, if there is no error, set the user password as the hash returned
              newUser.password = hash;

              //lastly, save the newUser object to the databse
              newUser
                .save()
                //this returns a user object
                .then((user) => {
                  //first, flash a sucess message
                  req.flash(
                    "success_msg",
                    "You are now registered and can log in!"
                  );
                  //if they have logged in, redirect them to the login screen
                  res.redirect("/users/login");
                })
                //if any errors, console.log(them)
                .catch((err) => {
                  console.log(err);
                });
            });
          });
        }
      })
      //if any errors, console.log(them)
      .catch((err) => console.log(err));
  }
});

//handle post requests to login (users submitting the login form)
router.post("/login", (req, res, next) => {
  //authenticate the user using passport with the local strategy
  passport.authenticate("local", {
    //we have to pass in parameters for redirects on success or failure
    //on success, redirect to chat
    successRedirect: "/chat/dashboard",
    //on failure, redirect to login page again
    failureRedirect: "/users/login",
    //we can also choose to flash a message on fail authenticate, which we will
    failureFlash: true,
    //lastly, this is required per the docs
  })(req, res, next);
});

//whenever a logout get request is recieved
router.get("/logout", (req, res) => {
  //log the user out using the passport middleware
  req.logout();
  //send a flash message to inform user that they have been logged out
  req.flash("success_msg", "You have been logged out");
  //redirect the user to the login page
  res.redirect("/users/login");
});

//export the router so we can use it for routing in app.js
module.exports = router;

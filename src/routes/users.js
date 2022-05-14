const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const passport = require("passport");

//LOGIN PAGE, render login view
router.get("/login", (req, res) => res.render("login"));

//REGISTER PAGE, render register view
router.get("/register", (req, res) => res.render("register"));

//REGISTER HANDLE
router.post("/register", (req, res) => {
  //breaking down the form submitted for register, into different variables
  const { name, email, password, password2 } = req.body;
  let errors = [];
  //CHECK REQUIRED FIELDS
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in empty fields." });
  }

  //CHECK IF PASSWORDS MATCH
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match." });
  }

  //CHECK THE PASSWORD LENGTH
  if (password.length < 8) {
    errors.push({ msg: "Password should be at least 8 characters" });
  }

  //if our errors array is any longer than 0 (there are any errors)
  if (errors.length > 0) {
    //keep the values that we had, and reneder them out, but ask for user to retry
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
    //if no errors
  } else {
    //IF THE VALIDATION PASSES
    //first, we have to make sure the user does not already exist
    User.findOne({ email: email })
      //returns a promise, with the user object
      .then((user) => {
        //if the user exists
        if (user) {
          //add a new error to our errors array
          errors.push({ msg: "Email is already registered" });
          //re-render the register page with the new error
          res.render("register", {
            errors,
            name,
            email,
            password,
            password2,
          });
          //otherwise, if the user doesn't exist
        } else {
          //use our user schema to create a new user, passing in all of the values they entered in the form
          const newUser = new User({
            name,
            email,
            password,
          });

          //to keep our password safe, we have to hash it
          //HASHING OUR PASSWORD

          //we hash a password by generating a salt
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;

              //then, we can set the user's password to the hashed value, to secure it
              newUser.password = hash;

              //THEN, WE SAVE THE USER TO THE DATABSE
              newUser
                .save()
                //then, we can flash a success message
                .then((user) => {
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

//LOGIN POST REQUEST HANDLING
router.post("/login", (req, res, next) => {
  //authenticate the user using passport
  passport.authenticate("local", {
    //setting up redirects on success or failure
    successRedirect: "/chat",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//LOGOUT HANDLE (SO OUR LOGOUT BUTTON WORKS)
router.get("/logout", (req, res) => {
  //log out the user, then flash a message and redirect
  req.logout();
  req.flash("success_msg", "You have been logged out");
  res.redirect("/users/login");
});

module.exports = router;

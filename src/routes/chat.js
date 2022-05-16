const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

//bring in our auth guard
const { ensureAuthenticated } = require("../config/auth");

//route for our dashboard
//when a get request is sent to /dashboard, we load index.html
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  //send the static file
  res.sendFile(path.join(path.join(__dirname, "../public"), "index.html"));
});

//route for our chat room
//when a get request is sent to /room, we load room.html
router.get("/room", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(path.join(__dirname, "../public"), "room.html"));
});

//export the router so we can use it for routing in app.js
module.exports = router;

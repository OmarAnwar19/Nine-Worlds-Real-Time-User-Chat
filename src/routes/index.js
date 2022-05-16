const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

//bring in our auth guard
const { ensureAuthenticated } = require("../config/auth");

//router allows us to route any incoming traffic
//here, whenever we recieve a get request to "/", we do the following:
//render the welcome view from our ejs views
router.get("/", (req, res) => res.render("welcome"));

//export the router so we can use it for routing in app.js
module.exports = router;

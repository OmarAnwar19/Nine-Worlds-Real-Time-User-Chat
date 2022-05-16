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

//here, whenever we recieve a request to "/dashboard", we do the following:
//we pass in ensureAuth middleware as our second paramter, to verify user login
//this checks that the user is allowed to access the chat
router.get("/chat", ensureAuthenticated, (req, res) => {
  //if so, then output the static index.html file for the chatroom
  fs.readFile(
    //our current path, with the public folder, then render index.html
    path.join(__dirname, "../public", "index.html"),
    (error, content) => {
      if (error) throw error;
      //we can set the content type of the text
      res.writeHead(200, { "Content-Type": "text/html" });

      //res.end ends our outut, here, we end by outputting our content
      //we obtain this content when we read the index.html file
      res.end(content);
    }
  );
});

//export the router so we can use it for routing in app.js
module.exports = router;

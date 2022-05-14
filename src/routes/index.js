const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

//WELCOME PAGE, render our welcome view
router.get("/", (req, res) => res.render("welcome"));

//DASBOARD, first, use our ensureAuthenticated middleware,
//this checks that the user is allowed to access the dashboard
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

module.exports = router;

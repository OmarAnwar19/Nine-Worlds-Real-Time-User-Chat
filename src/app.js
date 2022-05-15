const mongoose = require("mongoose");
const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const http = require("http");
const socketio = require("socket.io");
const app = express();
const db = require("./config/keys").MongoURI;

//NOTE: have to import http directly because socket.io needs direct access to it
//this is contrary to normal conventions, which is just using express app/router

//models
const User = require("./models/User");

//message formatting
const formatMessage = require("./utils/messages");
//import our user functions
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

//to use socket.io, which allows us to have realtime apps using websockets, we do 3 things
//first, intialize express
//second, we create a server variable, using a normal http server, and passing in our app
//third, we initiallize our socket.io by passing our server into socket.io
const server = http.createServer(app);
const io = socketio(server);

//require our passport config file
require("./config/passport")(passport);

//MONGOOSE AND MONGODB SETUP
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => console.log("Connected to MongoDB..."))
  .catch((err) => console.log(err));

//EJS MIDDLWARE
app.use(expressLayouts);
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

//BODYPARSER MIDDLEWARE
app.use(express.urlencoded({ extended: false }));

//EXPRESS SESSION MIDDLEWARE
app.use(
  session({
    secret: "Lj*4PKHU6im7utCBKD{-k-hXz[8Z#(WE=gD4{P*5wA",
    resave: true,
    saveUninitialized: true,
  })
);

//PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

//CONNECT FLASH MIDDLEWARE
app.use(flash());

//custom middleware for:
//GLOBAL VARIABLES (so we can make different coloured error and success messages)
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//ROUTES
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

//So, what does socket.io do? It is an open, bydirectional communication channel
//it allows us to send and receive signals and messages acrosss a server, without having to
//run it each time, or close it. It's like an open door between a client and a server, and allows
//either party to emit messages or signals back and forth

//set our static folder for our html
app.use(express.static(path.join(__dirname, "public")));

//variable for our bot name
const botName = "Hermod";

//run this as soon as a client connects
io.on("connection", (socket) => {
  //listen for a user to join a room
  socket.on("joinRoom", ({ username, room }) => {
    //first, create a user object using our userJoin function
    const user = userJoin(socket.id, username, room);
    //then, join the socket with the room coming from the usr
    socket.join(user.room);

    //send a message event, with content of "welcome to chatcord"
    //sends to all users
    socket.emit(
      "message",
      formatMessage(botName, "Welcome to Nine Worlds Chat")
    );

    //BRODCAST WHEN A NEW USER CONNECTS TO THE CHAT

    //socket.emit sends the message to only a specific user
    //socket.brodcast.emit sends the message to all users except the new one
    //io.emit() sends a messge to all users, including the new one

    //we can add .to(where) to emit to a certain location
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat.`)
      );

    //send the user and room info to the front end
    io.to(user.room).emit("roomusers", {
      //send an object with the room, and room users (using our function in users.js)
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //LISTEN FOR chatMessage
  socket.on("chatMessage", (msg) => {
    //get the current user, passing in the socket.id
    const user = getCurrentUser(socket.id);
    //output the chat message
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //BRODCAST WHEN A USER LEAVS THE CHAT
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    //if the user leave = true
    if (user) {
      //output a message to the chat room that the user left
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat.`)
      );

      //send the user and room info to the front end
      io.to(user.room).emit("roomusers", {
        //send an object with the room, and room users (using our function in users.js)
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

//start our server on our .env port, or port 5000
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}...`));

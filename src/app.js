//node imports
const mongoose = require("mongoose");
const path = require("path");
const express = require("express");
//allows us to create layouts for ejs views
const expressLayouts = require("express-ejs-layouts");
//allows us to use flash messages
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

//node imports for chat
const http = require("http");
const socketio = require("socket.io");
const app = express();

//get our mongo uri from keys
const db = require("./config/keys").MongoURI;

//NOTE: have to import http directly because socket.io needs direct access to it
//this is contrary to normal conventions, which is just using express app/router

//models
const User = require("./models/User");

//import our message format function
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

//require our passport config file, so we can auth users, passing in passport above
require("./config/passport")(passport);

//MONGOOSE AND MONGODB SETUP
//connect to mongo db
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => console.log("Connected to MongoDB..."))
  .catch((err) => console.log(err));

//MIDDLEWARE:
//EJS MIDDLWARE
app.use(expressLayouts);
//set our views path for ejs
app.set("views", path.join(__dirname, "/views"));
//set our view engine (templating) to ejs
app.set("view engine", "ejs");
//bodyparser middleware, so we can deal with any incoming request body
app.use(express.urlencoded({ extended: false }));
//middleware for express session
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

//middleware for connect flash
app.use(flash());

//we can either flash messages whenever we want them
//or, we can create some global messages, which we can use more than once
//for this, we make some middleware, which has all of these global messages
app.use((req, res, next) => {
  //we can save them using res.locals.VAR = value
  //save one for sucess_msg and error_msg
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");

  //lastly, any middleware needs to end with next()
  next();
});

//set a static folder so we can load all of our static html, css, js
app.use(express.static(path.join(__dirname, "public")));

//ROUTERS
//route 1, whenever a user accesses "/", we use the router in index
app.use("/", require("./routes/index"));
//route 2, whenever a user acesses /users, we use the router in users
app.use("/users", require("./routes/users"));

//So, what does socket.io do? It is an open, bydirectional communication channel
//it allows us to send and receive signals and messages acrosss a server, without having to
//run it each time, or close it. It's like an open door between a client and a server, and allows
//either party to emit messages or signals back and forth

//variable for our bot name
const botName = "Hermod";

//run this as soon as a client connects
io.on("connection", (socket) => {
  //when the server recieves a joinRoom event, i.e a user just joined
  socket.on("joinRoom", ({ username, room }) => {
    //first, create a user object using our userJoin function
    const user = userJoin(socket.id, username, room);
    //then, join the socket with the room coming from the user
    socket.join(user.room);

    //send a message event, welcoming users to chat
    socket.emit(
      "message",
      formatMessage(botName, "Welcome to Nine Worlds Chat")
    );

    //BRODCAST WHEN A NEW USER CONNECTS TO THE CHAT

    //socket.emit sends the message to only a specific user
    //socket.brodcast.emit sends the message to all users except the one that just connected
    //io.emit() sends a messge to all users, including the new one

    //we can add .to(where) to emit to a certain location
    socket.broadcast.to(user.room).emit(
      //brodcast the user that just joined the chat
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

  //listen for chatMessage event
  socket.on("chatMessage", (msg) => {
    //get the current user, passing in the socket.id
    const user = getCurrentUser(socket.id);
    //output the chat message, formatted using our function
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //brodcast message on user leave
  //brocasts a message to all users except the one that just left
  socket.on("disconnect", () => {
    //first, get the user using our userLeave function
    const user = userLeave(socket.id);

    //if the user is found
    if (user) {
      //emit the leave event and message
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

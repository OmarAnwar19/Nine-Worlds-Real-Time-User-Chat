//import our message format function
const formatMessage = require("./messages");
//import our user functions
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./users");

const ioServer = (io) => {
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
};

module.exports = ioServer;

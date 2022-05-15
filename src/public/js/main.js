//THIS IS OUR JAVASCRIPT FILE FOR OUR FRONTEND, OR CLIENT
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

//GET USERNAME AND ROOM FROM URL
let { username, room, code } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//if room-code != "", room = room-code
code != "" ? (room = code) : (room = room);

const socket = io();

//when a user joins the chat room, send the username and room name to the server
//send a joinRoom event, with content of username and room
socket.emit("joinRoom", { username, room });

//get the room and users so we can output them to chatroom
socket.on("roomusers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//$#$ we can then catch the emitted messages in our javascript file for our html,
//and we can deal with it, each time a message (or specific signal) is recieved

//MESSAGE FROM SERVER
//when a message event is received...
socket.on("message", (message) => {
  //output the message to the dom each time a "message" event is sent
  outputMessage(message);

  //each time we get a message, scroll down
  //do this by setting the scroll top as the height of the div scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //getting the value of the message using the value of the id in the html file
  const msg = e.target.elements.msg.value;
  //emit the chatMessage event to the server
  socket.emit("chatMessage", msg);

  //clear message input box
  e.target.elements.msg.value = "";
  //focus the cursor onto the message input box
  e.target.elements.msg.focus();
});

//output user messages to the dom
function outputMessage(message) {
  //create a new div element
  const div = document.createElement("div");
  //the the message class to the div
  div.classList.add("message");
  //add the message to the html of the new element
  //outputs the username, time and text from the message object
  div.innerHTML = `
  <p class="meta">${message.username}<span> ${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;

  //add the message to the dom
  chatMessages.appendChild(div);
}

//add the room name to dom
function outputRoomName(room) {
  //set the text of the roomName h2 tag, to the room paramter we passed in
  roomName.innerText = room;
}

//add the users to dom
function outputUsers(users) {
  //set the innter html of the userList ul in our dom
  //map over the users array, and output an li tag for each one
  //.join("") means that we concatenate the array into a string, with "" as seperator
  userList.innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
}

//THIS IS OUR JAVASCRIPT FILE FOR OUR FRONTEND, CHAT
//get our different elements from our static html
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

//JOIN THE SPECIFIED CHATROOM
socket.emit("joinRoom", { username, room });

//GET ROOM AND USERS
socket.on("roomusers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//$#$ we can then catch the emitted messages in our javascript file for our html,
//and we can deal with it, each time a message (or specific signal) is recieved

//MESSAGE FROM SERVER
socket.on("message", (message) => {
  outputMessage(message);

  //SCROLL DOWN EACH TIME WE GET A MESSAGE
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//ADD AN EVENT LISTENER FOR MESSEGE SUBMIT
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //GET MESSAGE TEXT
  const msg = e.target.elements.msg.value;

  //EMITTING A MESSAGE TO THE SERVER,
  socket.emit("chatMessage", msg);

  //CLEAR THE INPUT
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//OUTPUT MESSAGE TO DOM
function outputMessage(message) {
  //create the element, then add "message" as a class
  const div = document.createElement("div");
  div.classList.add("message");

  //change the contents of the div
  div.innerHTML = `
  <p class="meta"> ${message.username}<span> ${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;

  //then finally, append the new div to existing messages
  chatMessages.appendChild(div);
}

//FUNCTION TO ADD ROOM NAME TO DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

//ADD USERS TO DOM
function outputUsers(users) {
  //map over the users array, and output an li for each user
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}

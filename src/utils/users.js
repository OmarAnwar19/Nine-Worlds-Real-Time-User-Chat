//the array for our current users
const users = [];

//join a user to the chat
function userJoin(id, username, room) {
  //return the users array, while adding to it a new user
  //the new user will have the id, username, and room we passed in
  const user = { id, username, room };
  users.push(user);
  return user;
}

//function to get the current user
function getCurrentUser(id) {
  //filter through the users array, and return the one where the id = passed in id
  return users.find((user) => user.id === id);
}

//User leaves chat
function userLeave(id) {
  //setting index
  //loop through the users array, and check each user
  //if the user.id = the id paramter, then that index is returned to the variable
  //if no index is found, then -1 is returned, otherwise index will be smth else
  const index = users.findIndex((user) => user.id === id);

  //if index != -1, so if it actually found something
  if (index !== -1) {
    //return the users array, at index 0 (so the first item),
    //with one item removed starting from the index 1
    return users.splice(index, 1)[0];
  }
}

//get all users in a room
function getRoomUsers(room) {
  //filter through the users array, returning only those where the user.room
  //is the same one passed in through our parameters
  return users.filter((user) => user.room === room);
}

//export all of the user related functions
module.exports = { userJoin, getCurrentUser, userLeave, getRoomUsers };

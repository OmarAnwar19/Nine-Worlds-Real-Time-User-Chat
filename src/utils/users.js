const users = [];

//JOIN USER TO CHAT
function userJoin(id, username, room) {
  //extract the user info, then add it to the users array
  const user = { id, username, room };
  users.push(user);

  return user;
}

//CREATE A FUNCTION TO GET THE CURRENT USER
function getCurrentUser(id) {
  //find the first user with the same user.id as the one entered
  return users.find((user) => user.id === id);
}

//USER LEAVS CHAT
function userLeave(id) {
  //find the first user with the same user.id as the one entered
  const index = users.findIndex((user) => user.id === id);

  //if the user is actually found
  if (index !== -1) {
    //remove the user from the users array
    return users.splice(index, 1)[0];
  }
}

//GET ROOM USERS
function getRoomUsers(room) {
  //filter all of the users in the users array, who are in the same room as entered parameter
  return users.filter((user) => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
};

const users = [];

//addUser - track a new user,
//removeUser - stop tracking user when the user leave,
//getUser - fetch an existing user data,
//getUsersinRoom - get users in room (will appear in the side bar)

const addUser = ({ id, username, room }) => {
  //every single connection to the server has a unique ID
  //Clean the data
  //lowercase usernames, room and remove extra spaces, validate also
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!"
    };
  }

  //Check for existing users
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  //Validate username
  if (existingUser) {
    return {
      error: "Username is taken!"
    };
  }

  //Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//Removing user
const removeUser = id => {
  const index = users.findIndex(user => user.id === id); // returns 0 / so on if matched

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//find user
const getUser = id => {
  return users.find(user => user.id === id);
};

//get users in a specific room
const getUsersinRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersinRoom
};

// const data = addUser({
//   id: 21,
//   username: "Lowencho",
//   room: "NowhereLand"
// });
// console.log(data);

// addUser({
//   id: 20,
//   username: "Lowenchoz",
//   room: "NowhereLand"
// });
//
// addUser({
//   id: 21,
//   username: "Lowenchozz",
//   room: "NowhereLand"
// });
//
// const data = getUser(21);
// console.log(data);
//
// const data2 = getUsersinRoom("nowhereland");
// console.log(data2);

// const res = addUser({
//   id: 22,
//   username: "Lowenchoz",
//   room: "NowhereLandz"
// });
//
// console.log(users);
// removeUser(21);
// console.log(users);

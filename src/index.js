const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages.js");

//tracking users
const {
  addUser,
  removeUser,
  getUser,
  getUsersinRoom
} = require("./utils/users.js");

const app = express();
const server = http.createServer(app); //create new webserver
const io = socketio(server); //socket io expects it to be called with the raw http server

const port = process.env.PORT;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
  // socket = object contains info about that new connection
  console.log("New websocket connection!");

  //Join specific room
  socket.on("join", ({ username, room }, callback) => {
    //adding user when a user connects
    //accessing the user and error wherein addUser returns either user or error
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room); //allows to join given chatroom

    // socket.emit("message", "Welcome!");
    socket.emit("message", generateMessage("Welcome!", "Admin")); //setting admin as name

    // socket.broadcast.emit("message", "A new user has joined!");
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} has joined!`, "Admin")
      );
    //send a message to all connected user, except this connection

    //Displaying all the users in the sidebar
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersinRoom(user.room)
    });

    callback();
  });

  //Sending message
  socket.on("sendMessage", (message, callback) => {
    //find the user
    const user = getUser(socket.id);

    //acknowledgement was used
    const filterWord = new filter();
    if (filterWord.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    // console.log("i receive a message");

    callback();

    //send message to all connected users
    // io.emit("message", message);
    io.to(user.room).emit("message", generateMessage(message, user.username));
  });

  //Sending location
  socket.on("sendLocation", (location, callback) => {
    //find the user
    const user = getUser(socket.id);

    // io.emit(
    //   "messageLocation",
    //   `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    // );
    io.to(user.room).emit(
      "messageLocation",
      generateLocationMessage(
        `https://www.google.com/maps?q=${location.latitude},${
          location.longitude
        }`,
        user.username
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    //Removing a user from array when a user disconnect
    const user = removeUser(socket.id);

    //sends a message when a user disconnect to all user's whos connected
    // io.emit("message", "A user has left");
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left the chat.`, "Admin")
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersinRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log("Server is up on port " + port);
});

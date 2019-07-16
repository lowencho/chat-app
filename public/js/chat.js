const socket = io(); //to connect to the server

//Elements
const messages = document.querySelector("#messages");
const userSideBar = document.querySelector("#sidebar");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options using query string / qs library to parse query string to object
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
}); // ignore '?' (optional)

//Automatic Scrolling feature
const autoscroll = () => {
  //new message element
  const newMessage = messages.lastElementChild;

  //height of the new message
  const newMessageStyles = getComputedStyle(newMessage); //list all the styles used
  const newMessageMargin = parseInt(newMessageStyles.marginBottom); //accessing the style marginBottom
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin; //adding the style offsetheight with marginbotom

  //visible height of the chat div
  const visibleHeight = messages.offsetHeight;

  //height of messages container
  const containerHeight = messages.scrollHeight; //height we can scroll

  //How far have i scrolled
  const scrollOffset = messages.scrollTop + visibleHeight; //the amount of distance we scroll from the top

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight; //put to the bottom
  }

  // console.log(newMessageHeight);
};

//printing the message to the DOM w/ mustache template
socket.on("message", message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"), //using momentjs library
    username: message.username //setting name to chat
  }); //referenced to the html (dynamic)
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

//Share Location message to the DOM w/ mustache template
socket.on("messageLocation", url => {
  console.log(url);
  const html = Mustache.render(locationTemplate, {
    url: url.text,
    createdAt: moment(url.createdAt).format("h:mm a"), //using momentjs library
    username: url.username
  }); //referenced to the html (dynamic)
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

//Getting all the current users inside the chatroom
socket.on("roomData", ({ room, users }) => {
  console.log(room);
  console.log(users);
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  userSideBar.innerHTML = html;
});

//Elements
const chatForm = document.querySelector("form");
const chatFormButton = chatForm.querySelector("button");
const chatFormInput = chatForm.querySelector("input");

// const message = document.querySelector("input");
//emitting chat message to the server
chatForm.addEventListener("submit", e => {
  e.preventDefault();

  //disable button
  chatFormButton.setAttribute("disabled", "disabled"); //last arg, attri. name

  const message = e.target.elements.message;

  socket.emit("sendMessage", message.value, error => {
    //enable button
    chatFormButton.removeAttribute("disabled");
    chatFormInput.value = "";
    chatFormInput.focus(); //active type cursor

    if (error) {
      return console.log(error);
    }

    console.log("The message was delivered");
  }); //last arg, event acknowledgement
  // message.value = "";
});

//emitting location to server
const shareLocation = document.querySelector("#share-location");
shareLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("This browser doesn't support geolocation!");
  }
  //disable button
  shareLocation.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    //async but doesn't support promises, async/await
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      error => {
        if (error) {
          return console.log(error);
        }
        console.log("Location shared!");

        //enable button
        shareLocation.removeAttribute("disabled");
      }
    );
  });
});

//emitting the username and room name to the server
socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    //redirect to root page
    location.href = "/";
  }
});

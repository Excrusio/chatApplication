//Import express app
const express = require("express");
const app = express();

// Import socket.io
const io = require("socket.io");
const port = 3000;

const bodyParser = require("body-parser");
const chatRouter = require("./routes/ChatRoute");
// const loginRouter = require("./routes/LoginRouter");

// bodyparser middleware
app.use(bodyParser.json());

// routes
app.use("/chats", chatRouter);
// app.use("/login", loginRouter);

//set the express.static middleware
app.use(express.static(__dirname + "/public"));

//Import http module
const http = require("http").Server(app);

const socket = io(http);

// Database connection
const Chat = require("./models/ChatSchema");
const connect = require("./DBConnection");

socket.on("connection", (socket) => {
	// Handle the connection and disconnection of the user.
	console.log("User Connected.");

	socket.on("disconnect", () => {
		console.log("User Disconnected");
	});

	//Someone is typing
	socket.on("typing", (data) => {
		socket.broadcast.emit("notifyTyping", {
			user: data.user,
			message: data.message,
		});
	});

	// When someone stops typing
	socket.on("stopTyping", () => {
		socket.broadcast.emit("notifyStopTyping");
	});

	// Handle the incoming message and broadcast it.
	socket.on("chat message", (message) => {
		console.log(`Message: ${message}`);

		// Broadcast the message to everyone except us.
		// Removing broadcast makes us receive the message as well.
		socket.broadcast.emit("received", { message: message });

		// Store the message in database.
		connect.then(() => {
			console.log("Connected successfully to the server");
			if (message !== "") {
				let chatMessage = new Chat({ message: message, sender: "Anonymous" });
				chatMessage.save();
			}
		});
	});
});

http.listen(port, () => {
	console.log("Running on Port: " + port);
});

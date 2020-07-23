const express = require("express");
const connectDB = require("../DBConnection");
const Chats = require("../models/ChatSchema");
const router = express.Router();

router.route("/").get((req, res, next) => {
	res.setHeader("Content-Type", "application/json");
	res.statusCode = 200;
	connectDB.then(() => {
		Chats.find({}).then((chat) => {
			res.json(chat);
		});
	});
});
module.exports = router;

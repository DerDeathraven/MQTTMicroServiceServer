const express = require("express");
const http = require("http");
const app = express();
const port = 3000;
const path = require("path");
const socketio = require("socket.io");

const server = app.listen(port, () => {
  console.log(`started on port: ${port}`);
});

const io = socketio(server);
const MqttManager = require("./classes/mqttManager");
const Client = require("./classes/client");

const mqttManager = new MqttManager(io);

var folder = path.join(__dirname, "public");

app.use(express.static(folder));
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: folder });
});

io.on("connection", (socket) => {
  mqttManager.addClient(socket);
});

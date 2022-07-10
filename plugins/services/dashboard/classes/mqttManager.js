const mqtt = require("mqtt");
const Client = require("./client");

class MqttManager {
  constructor(io) {
    this.mqtt = mqtt.connect("mqtt://localhost:");
    this.io = io;

    this.clients = [];
    this.serverData = {};

    this.init();
    this.mqtt.publish("/server/calls/getServerData", "true");
  }
  init() {
    this.mqtt.subscribe("/server/api/#");
    this.mqtt.on("message", this.handleIncoming);
  }
  addClient(socket) {
    var cli = new Client(this.io, socket, this);
    this.clients.push(cli);
  }
  handleIncoming(topic, message) {
    var mainTopic = topic.split("/").pop();

    this.serverData[mainTopic] = message;
  }
}
module.exports = MqttManager;

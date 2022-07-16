const mqtt = require("mqtt");
const Client = require("./client");

class MqttManager {
  constructor(io) {
    this.mqtt = mqtt.connect("mqtt://localhost:");
    this.io = io;

    this.clients = [];
    this.serverData = {};

    this.init();
    this.getServerData();
  }
  init() {
    this.mqtt.subscribe("/server/api/#");
    this.mqtt.on("message", this.handleIncoming.bind(this));
  }
  addClient(socket) {
    var cli = new Client(this.io, socket, this);
    this.clients.push(cli);
  }
  handleIncoming(topic, message) {
    switch (topic) {
      default:
        var mainTopic = topic.split("/").pop();

        this.serverData[mainTopic] = JSON.parse(message);
        this.clients.forEach((client) => {
          client.updateData(this.serverData);
        });
        break;
    }
  }
  getServerData() {
    this.mqtt.publish("/server/calls/getServerData", "true");
  }
}
module.exports = MqttManager;

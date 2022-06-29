const mqtt = require("mqtt");
const ClientManager = require("./clientManager");
const HttpServer = require("./httpServer");

class MqttManager {
  constructor() {
    this.clientManager = new ClientManager(this);
    this.httpServer = new HttpServer(this.clientManager);
    this.client = mqtt.connect("mqtt://localhost");
    this.client.on("connect", () => {
      console.log("[MQTT] Connected");
      this.setSubscriber();

      this.client.on("message", (topic, msg) => {
        this.handleMessage(topic, msg);
      });
    });
  }
  setSubscriber() {
    this.client.subscribe("/login/#");
    this.client.subscribe("/request/#");
  }
  handleMessage(topic, msg) {
    var mainTopic = topic.split("/")[1];
    switch (mainTopic) {
      case "login":
        msg = JSON.parse(msg);
        this.clientManager.login(msg);
        this.httpServer.init();
        break;
    }
  }
}

module.exports = MqttManager;

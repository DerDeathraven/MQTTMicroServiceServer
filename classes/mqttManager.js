const mqtt = require("mqtt");
const ClientManager = require("./clientManager");
const HttpServer = require("./httpServer");
const ServiceManager = require("./serviceManager");
const JLCD = require("../jlcd");

class MqttManager {
  constructor() {
    this.handler = {};
    this.handler.clientManager = new ClientManager(this);
    this.handler.serviceManager = new ServiceManager(this);
    this.handler.httpServer = new HttpServer(
      this.handler.clientManager,
      this.handler.serviceManager
    );
    this.client = mqtt.connect("mqtt://localhost");

    this.client.on("connect", () => {
      console.log("[MQTT] Connected");
      this.setSubscriber();

      this.client.on("message", (topic, msg) => {
        this.handleMessage(topic, msg);
      });
      this.client.publish("/allClients/restart", "true");
    });

    this.meta = {
      topics: [],
    };
    this.pingReady = true;
    this.updateData();
  }
  setSubscriber() {
    this.client.subscribe("/login/#");
    this.client.subscribe("/request/#");
    this.client.subscribe("/server/#");
    this.client.subscribe("#");
  }
  handleMessage(topic, msg) {
    this.addTopic(topic, msg);
    var mainTopic = topic.split("/")[1];
    switch (mainTopic) {
      case "login":
        msg = JSON.parse(msg);
        this.handler.clientManager.login(msg);
        this.handler.httpServer.init();
        this.updateData();
        break;
      case "server":
        this.handleServerApi(topic, msg);

        break;
    }
    //this.exposeMeta();
  }
  handleServerApi(topic, msg) {
    topic = topic.split("/");
    topic.shift();

    switch (topic.pop()) {
      case "getServerData":
        this.updateData();
        break;
      case "ping":
        this.ping();
        break;
    }
    if (topic.pop() === "getServerData") {
    }
  }
  updateData() {
    for (const [key, value] of Object.entries(this.handler)) {
      value.exposeMeta();
    }
    this.exposeMeta();
  }
  addTopic(topic, msg) {
    try {
      msg = JSON.parse(msg);
    } catch {}

    var item = this.meta.topics.findIndex((t) => t.name == topic);
    if (item == -1) {
      var obj = {
        name: topic,
        messages: [msg],
        calledTimes: 1,
      };
      this.meta.topics.push(obj);
    } else {
      this.meta.topics[item].messages.push(msg);
      this.meta.topics[item].calledTimes++;
    }
  }

  exposeMeta() {
    this.client.publish("/server/api/mqttData", JSON.stringify(this.meta));
  }
  ping() {
    if (this.pingReady) {
      this.client.publish("/server/lifeSign", "true");
      this.pingReady = false;
      setTimeout(() => {
        this.pingReady = true;
      }, 2000);
    }
  }
}

module.exports = MqttManager;

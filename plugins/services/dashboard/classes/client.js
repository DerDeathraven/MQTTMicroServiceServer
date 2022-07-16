class Client {
  constructor(io, socket, mqttManager) {
    this.io = io;
    this.socket = socket;
    this.mqttManager = mqttManager;

    this.setEvents();
  }
  setEvents() {
    this.socket.on("getServerData", (data) => {
      this.mqttManager.getServerData();
    });
    this.socket.on("lifeSignUpdate", (data) => {
      this.socket.emit("lifeSignUpdate", "true");
    });
  }
  updateData(data) {
    this.socket.emit("updateServerData", data);
  }
  topicNews(data) {
    this.socket.emit("topicNews", data);
  }
}

module.exports = Client;

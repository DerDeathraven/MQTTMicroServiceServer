class Client {
  constructor(io, socket, mqttManager) {
    this.io = io;
    this.socket = socket;
    this.mqttManager = mqttManager;
  }
  setEvents() {
    this.socket.on("test", () => {
      console.log("trs");
    });
  }
}

module.exports = Client;

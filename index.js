const MqttManager = require("./classes/mqttManager");
const JLCD = require("./jlcd");

var mqttManager = new MqttManager();
mqttManager.clientManager.login({
  name: "testClient",
  ip: "localhost",
  services: [
    {
      name: "testService",
      port: 8081,
    },
  ],
  ownServices: [],
});

setTimeout((f) => {
  mqttManager.clientManager.startService("webTestServer");
}, 5000);
setTimeout((f) => {
  mqttManager.clientManager.stopService("webTestServer");
}, 10000);

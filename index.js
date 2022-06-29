const MqttManager = require("./classes/mqttManager");
const JLCD = require("./jlcd");

var mqttManager = new MqttManager();

setTimeout((f) => {
  mqttManager.clientManager.startService("webTestServer");
  mqttManager.clientManager.startService("webisso");
}, 5000);
/*setTimeout((f) => {
  mqttManager.clientManager.stopService("webTestServer");
  mqttManager.clientManager.stopService("webisso");
}, 10000);*/

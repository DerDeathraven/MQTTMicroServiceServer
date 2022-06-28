const JLCD = require("../jlcd"); //my Helper Module
const mqtt = require("mqtt");
const Client = require("./client");

const mqttClient = mqtt.connect("mqtt://localhost");
/**
 * A class to handle all the data of clients
 */
class ClientManager {
  constructor(mqttManager) {
    this.mqttManager = mqttManager;

    this.serviceLookupTable = {};
    this.clients = [];
    this.startedServices = [];
  }
  login(meta) {
    if (JLCD.arrayItemAlreadyExists(this.clients, "name", meta) == -1) {
      this.clients.push(new Client(meta, mqttClient));
    }

    this.createNewLookupTable();
    console.log(this.clients);
  }
  startService(service) {
    var c = this.serviceLookupTable[service];
    if (c == undefined) return;
    var serv = c.services[service];
    if (serv.dependencies.length > 0) {
      serv.dependencies.forEach((dep) => {
        if (this.startedServices.indexOf(dep) == -1) {
          var depClient = this.serviceLookupTable[dep];

          dep = depClient.services[dep];
          dep.dependOn.push(service);
          this.startService(dep.name);
        }
      });
    }
    this.startedServices.push(service);
    c.start(service, this.startedServices);
  }

  /**
   * @todo Implement Dependencies managment to better performance
   * @param {string} service
   */
  stopService(service) {
    var c = this.serviceLookupTable[service];
    var serv = c.services[service];
    if (serv.dependencies.length > 0) {
      serv.dependencies.forEach((dep) => {
        if (this.startedServices.indexOf(dep) != -1) {
          var depClient = this.serviceLookupTable[dep];
          dep = depClient.services[dep];
          var pos = dep.dependOn.indexOf(service);
          dep.dependOn.splice(pos, 1);
          if (dep.dependOn.length == 0) {
            this.stopService(dep.name);
          }
        }
      });
    }
    var pos = this.startedServices.indexOf(service);
    this.startedServices.splice(pos, 1);
    c.stop(service, this.startedServices);
  }

  /**
   * Creates a Hashtable for the Client - Service Relationship
   * @return {Object} looks something like service1:client1
   *
   */
  createNewLookupTable() {
    var retObject = {};
    this.clients.forEach(function (client) {
      for (const [key, value] of Object.entries(client.services)) {
        retObject[key] = client;
      }
    });

    this.serviceLookupTable = retObject;
  }
}

module.exports = ClientManager;

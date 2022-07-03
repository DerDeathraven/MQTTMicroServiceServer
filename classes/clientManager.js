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

  /**
   * adds the new client to the collectiv
   * @param {object} meta
   */
  login(meta) {
    if (JLCD.arrayItemAlreadyExists(this.clients, "name", meta) == -1) {
      var newClient = new Client(meta, mqttClient);
      console.log(`New client connected: ${newClient.name}`);
      this.clients.push(newClient);
    } else {
      var pos = JLCD.arrayItemAlreadyExists(this.clients, "name", meta);
      this.clients.splice(pos, 1);
      var newClient = new Client(meta, mqttClient);
      this.removeStartedServices(newClient);
      this.clients.push(newClient);
      console.log(`updated client ${newClient.name}`);
    }

    this.createNewLookupTable();
  }

  /**
   * Checks if the new Client already started their services
   * @param {Client} newClient
   */
  removeStartedServices(newClient) {
    for (const [key, value] of Object.entries(newClient.services)) {
      if (value.started == false) {
        if (this.startedServices.indexOf(key) != -1) {
          console.log("test");
          var pos = this.startedServices.indexOf(key);
          this.startedServices.splice(pos, 1);
        }
      } else {
        if (this.startedServices.indexOf(key) == -1) {
          this.startedServices.push(key);
        }
      }
    }

    Object.keys(newClient.services).forEach((k) => {
      if (this.startedServices.indexOf(k) != -1) {
        var pos = this.startedServices.indexOf(k);
        this.startedServices.splice(pos, 1);
      }
    });
  }

  /**
   * Starts a service and checks its dependencies and if needed starts them too.
   * @param {string} service
   *
   */
  startService(service) {
    var c = this.serviceLookupTable[service];

    if (c == undefined) return;
    if (this.startedServices.indexOf(service) != -1) return;

    var serv = c.services[service];
    this.startedServices.push(service);
    if (serv.dependencies.length > 0) {
      serv.dependencies.forEach((dep) => {
        var depClient = this.serviceLookupTable[dep];
        dep = depClient.services[dep];
        dep.dependOn.push(service);

        this.startService(dep.name);
      });
    }

    c.start(service, this.startedServices);
  }

  /**
   * @see startService function
   * @param {string} service
   */
  stopService(service) {
    var c = this.serviceLookupTable[service];
    if (c == undefined) return;
    if (this.startedServices.indexOf(service) == -1) return;
    var serv = c.services[service];
    var pos = this.startedServices.indexOf(service);
    this.startedServices.splice(pos, 1);
    c.stop(service, this.startedServices);
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

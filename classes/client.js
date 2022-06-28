/**
 * a Client is a PC or a Language on a PC.
 * 1 PC could have 2 Clients, one for Nodejs and one for Rust.
 */
class Client {
  constructor(meta, mqttClient) {
    this.name = meta.name;
    this.ip = meta.ip;
    this.services = this.fillServices(meta.services);
    this.ownServices = this.fillOwnServices(meta.ownServices);
    this.mqttClient = mqttClient;
  }
  fillServices(services) {
    var retArr = {};
    services.forEach((s) => {
      retArr[s.name] = new Service(s);
    });
    return retArr;
  }
  fillOwnServices(ownServices) {
    var retArr = [];
    ownServices.forEach((s) => {
      retArr.push(new OwnService(s));
    });
    return retArr;
  }
  start(service) {
    this.mqttClient.publish(`/clients/${this.name}/start`, service);
  }
  stop(service) {
    this.mqttClient.publish(`/clients/${this.name}/stop`, service);
  }
}

/**
 * A Service is a application that can be called
 */
class Service {
  constructor(serv) {
    this.name = serv.name;
    this.dependencies = serv.dependencies || [];
    this.dependOn = [];
    this.port = serv.port;
  }
}
class OwnService {
  constructor(serv) {
    this.name = serv.name;
    this.dependencies = serv.dependencies || [];
  }
}
module.exports = Client;

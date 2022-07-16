const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const serviceLocation = "./plugins/services/";

/**
 * Manages Services that the Server is running
 * @constructor
 */
class ServiceManager {
  constructor(mqttManager) {
    this.mqttManager = mqttManager;
    this.services = {};
    this.init();
  }
  init() {
    const services = fs.readdirSync(serviceLocation);
    services.forEach((f) => {
      var meta = fs.readFileSync(serviceLocation + f + "/config.json", "utf8");
      meta = JSON.parse(meta);
      this.services[f] = new Service(f, meta);
    });
    this.startAutorun();
  }
  startAutorun() {
    for (const [key, val] of Object.entries(this.services)) {
      if (val.autorun == true) {
        val.start();
      }
    }
  }
  exposeMeta() {
    var sender = this.mqttManager.client;

    var services = [];
    for (const [key, f] of Object.entries(this.services)) {
      var obj = {
        name: f.name,
        port: f.port,
        running: f.process === null ? false : true,
      };
      services.push(obj);
    }
    sender.publish("/server/api/serverServices", JSON.stringify(services));
  }
}

class Service {
  constructor(name, meta) {
    this.name = name;
    this.autorun = meta.autorun || false;
    this.startFile = meta.startFile || "index.js";
    this.port = meta.port || 0;
    this.process = null;
  }
  start() {
    console.log(`[${this.name}] Starting Process`);
    this.process = child_process.fork(
      serviceLocation + this.name + "/" + this.startFile,
      [],
      { silent: true }
    );
    this.attachListners();
  }
  kill() {
    this.process.kill();
  }
  attachListners() {
    this.process.stdout.on("data", (data) => {
      data = data.toString().trim();
      console.log(`[${this.name}]${data}`);
    });
    this.process.on("close", (data) => {
      console.log(`[${this.name}]Closed`);
      this.process = null;
    });
    this.process.stderr.on("data", (err) => {
      console.warn(`[${this.name}]Error: ${err}`);
    });
  }
}
module.exports = ServiceManager;

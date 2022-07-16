const httpProxy = require("http-proxy");
const url = require("url");
const http = require("http");
const { response } = require("express");

const PORT = 1885;

class HttpServer {
  constructor(clientManager, serviceManager) {
    this.clientManager = clientManager;
    this.serviceManager = serviceManager;
    this.options = {};
    this.init();
    this.setServer();
    this.proxy = httpProxy.createProxy();
  }
  init() {
    this.setOptions();
    //this.setOwnServiceOptions()
  }
  setOptions() {
    this.clientManager.clients.forEach((client) => {
      for (const [key, value] of Object.entries(client.services)) {
        if (value.port !== undefined) {
          var path = `/services/${key}`;
          this.options[path] = `http://${client.ip}:${value.port}`;
        }
      }
    });
    for (const [key, value] of Object.entries(this.serviceManager.services)) {
      if (value.port !== undefined) {
        if (value.process !== null) {
          const path = `/${key}`;
          this.options[path] = `http://localhost:${value.port}`;
        }
      }
    }
  }
  setServer() {
    this.server = http.createServer((req, res) => {
      const pathname = url.parse(req.url).pathname;
      var isInOption = false;
      for (const [pattern, target] of Object.entries(this.options)) {
        if (pathname === pattern || pathname.startsWith(pattern + "/")) {
          isInOption = true;
          req.url = "";
          res.writeHead(301, { location: target }).end();
          //this.proxy.web(req, res, { target });
        }
      }
      if (isInOption == false) {
        res.write("not Found or not Started yet");
        res.end();
      }
    });
    this.server.listen(PORT);
  }

  /**
   * @todo Add support for self stated Services
   */
  setOwnServiceOptions() {
    for (const [key, value] of Object.entries(
      this.ownServiceManager.services
    )) {
    }
  }
  exposeMeta() {}
}

module.exports = HttpServer;

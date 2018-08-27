function httpServer(instance) {
  const http = require("http");
  const bodyParser = require("body-parser");
  const express = require("express");
  const app = express();
  const server = http.createServer(app);
  const CORSModule = require("@altrdpdgm/cors")()
  CORSModule.setOriginList(["http://localhost:3000", "http://192.168.254.4:3000", "http://192.168.1.89:3000"]);

  app.use(CORSModule.handleCORS);
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  function start(options) {
    server.listen(process.env.PORT || 8080);

    console.log("Express server listening on port %d in %s mode",
    server.address().port, process.env.NODE_ENV || "production");
  }

  instance.httpServer = {start, app};
}

module.exports = httpServer;
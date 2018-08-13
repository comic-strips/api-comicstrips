function httpServer(instance) {
  const http = require("http");
  const bodyParser = require("body-parser");
  const express = require("express");
  const app = express();
  const server = http.createServer(app);

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
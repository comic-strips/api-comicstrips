function httpServer(instance) {
  const http = require("http");
  const bodyParser = require("body-parser");
  const express = require("express");
  const app = express();
  const server = http.createServer(app);

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  function start(options) {
    server.listen(process.env.PORT || 3000);

    console.log("Express server listening on port %d in %s mode",
    server.address().port, app.settings.env);
  }

  instance.$httpServer = {start, app};
}

module.exports = httpServer;
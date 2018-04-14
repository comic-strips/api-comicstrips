"use strict";

var loopback = require("loopback");
var boot = require("loopback-boot");
var app = loopback();
loadEnvironment();

module.exports = app;

app.start = function() {
  // start the web server
  app.Utils.Events.eventEmitter.emit("server:App-Start", this);
  // Modules that react to emitted events initialized on App-Start 
  const mailer = require("./mailer")(this);
  const sms = require("./sms")(this);
  const payments = require("./payments")(this);
  const localtunnelModule = require("./utils/local-tunnel")({
    subdomain: process.env.LOCALTUNNEL_SUBDOMAIN,
    environment: process.env.NODE_ENV,
    port: process.env.NODE_ENV.LOCALTUNNEL_PORT
  });

  //localtunnelModule.listen();

  return app.listen(function() {
    app.emit("started");
    var baseUrl = app.get("url").replace(/\/$/, '');
    console.log("Web server listening at: %s", baseUrl);
    if (app.get("loopback-component-explorer")) {
      var explorerPath = app.get("loopback-component-explorer").mountPath;
      console.log("Browse your REST API at %s%s", baseUrl, explorerPath);
    }
  });
};

function loadEnvironment() {
  if (process.env.NODE_ENV === "production") {
    return;
  } else {
    const dotenv = require("dotenv").config();
  }
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

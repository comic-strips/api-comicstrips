"use strict";

module.exports = function(app) {
  var router = app.loopback.Router();

  router.get("/", app.loopback.status());
  app.use(router);
  app.Utils = require("../utils");
};

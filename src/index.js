const httpServer = require("./http");
const systemAPI = require("./api-system");
const bookingsAPI = require("./api-bookings");
const accountsAPI = require("./api-accounts");
const dataSources = require("./data-sources");

module.exports = {httpServer, dataSources, systemAPI, bookingsAPI, accountsAPI}
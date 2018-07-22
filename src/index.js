module.exports = {
  httpServer: require("./http"),
  dataSources: require("./data-sources"), 
  systemAPI: require("./api-system"),
  customersAPI: require("./api-customers"), 
  bookingsAPI: require("./api-bookings"), 
  accountsAPI: require("./api-accounts"),
  recipientsAPI: require("./api-recipients"),
  vendorsAPI: require("./api-vendors")
}
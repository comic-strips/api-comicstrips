module.exports = {
  httpServer: require("./http"),
  dataSources: require("./data-sources"),
  eventEmitter: require("./event-emitter"),
  sms: require("./sms"), 
  mail: require("./mailer"),
  systemAPI: require("./api/system"),
  customersAPI: require("./api/customers"), 
  bookingsAPI: require("./api/bookings"), 
  accountsAPI: require("./api/accounts"),
  recipientsAPI: require("./api/recipients"),
  ordersAPI: require("./api/orders"),
  skusAPI: require("./api/skus"),
  talentAPI: require("./api/talent"),
  vendorsAPI: require("./api/vendors")
}
module.exports = {
  httpServer: require("./http"),
  dataSources: require("./data-sources"),
  eventEmitter: require("./event-emitter"),
  sms: require("./sms"), 
  mail: require("./mailer"),
  payments: require("./payments"),
  systemAPI: require("./api/system"),
  customersAPI: require("./api/customers"), 
  bookingsAPI: require("./api/bookings"), 
  issuesAPI: require("./api/issues"),
  accountsAPI: require("./api/accounts"),
  recipientsAPI: require("./api/recipients"),
  offersAPI: require("./api/offers"),
  ordersAPI: require("./api/orders"),
  skusAPI: require("./api/skus"),
  talentAPI: require("./api/talent"),
  vendorsAPI: require("./api/vendors")
}
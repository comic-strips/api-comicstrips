"use strict";

module.exports = function(Bookings) {
  /* import directly from utils module; app is not ready yet. */
  const {Events, Meta} = require("../../server/utils");
  const {promisify} = require("util");
  const eventEmitter = Events.eventEmitter;

  eventEmitter.on("server:App-Start", (app)=> {
    const {accountManagers, offers, bookings, talent, customers} = app.models;
    /* complete list of application models unavailable until App-Start */
    const acctModule = require("../accounts")(app);

    Bookings.observe("before save", beforeSaveHook.bind(null, acctModule,accountManagers));
    Bookings.observe("after save", afterSaveHook);

    Bookings.accept = function(data, cb) {
      const {From, Body} = data;
      const offer_id = parseInt(Body.split(" ")[1]);

      talent.find()
      .then(talentList=> talentList.find((tal)=> tal.phoneNumber === From))
      .then(onTalentList.bind(null, Bookings, offer_id))
      .then(getBookingCustomer.bind(null, customers))
      .then(getBookingAccountManager.bind(null, accountManagers))
      .then(updateBookingData);

      cb(null, data);
    };
  /*===server:App-Start===*/  
  });

  function getBookingCustomer(customers, data) {
    return customers.find()
    .then(customerList=> customerList.find((cust)=> cust.id === data.booking.customer_id))
    .then((customer)=> Object.assign(data, {customer}));
  }

  function getBookingAccountManager(accountManagers, data) {
    return accountManagers.findOne({
      where: {id: data.booking.accountManager_id}
    }).then(accountManager=> Object.assign(data, {accountManager}));
  }

  function updateBookingData({accountManager, booking, customer, talent}) {
    booking.updateAttribute("status", "CONFIRMED");
    booking.updateAttribute("talent_id", talent.id);
    eventEmitter.emit("bookingConfirmed", {
      booking, 
      talent,
      accountManager,
      customer
    });

  }

  function onTalentList(Bookings, offer_id, tal) {
    /* Loopback's Model.find does actually not filter */
    return Bookings.find().then((bookingsList)=> {
      const booking = bookingsList.find((booking)=> booking.offer_id === offer_id);
      return {booking, talent: tal}
    });
  }

  /*=== LoopBack Operation Hooks ===*/

  function beforeSaveHook(acctModule, accountManagers, context, next) {
    if(!context.isNewInstance) {
      next();
      return;
    }
    accountManagers.find()
    .then(acctModule.onAccountManagers)
    .then(acctModule.assignAccountManager.bind(null, context))
    .then((acctMgr)=> {
      context.instance.offer_id = Meta.generateRefNo();
      next();
    })
    .catch(onError);
  }

  function afterSaveHook(context, next) {
    if(!context.isNewInstance) {
      next();
      return;
    }
    eventEmitter.emit("bookingCreated", context.instance);
    next();
    return;
  }

  function onError(err) {
    console.log(err);
  };
};

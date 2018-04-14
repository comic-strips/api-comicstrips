function mailerModule(app) {
  const {Utils} = app;
  const {customers} = app.models; 
  const eventEmitter = Utils.Events.eventEmitter;
  const templateModule = require("./template");
  const dispatchModule = require("./dispatch")({templateModule});

  eventEmitter.on("bookingCreated", (booking)=> {
    customers.findById(booking.customer_id)
    .then((cust)=> {
      dispatchModule.sendEmail("bookingCreated", booking, [cust]);
    });
  });

  eventEmitter.on("bookingConfirmed", ({accountManager, booking, customer, talent})=> {
    dispatchModule.sendEmail("bookingConfirmed", booking, [
      accountManager, 
      customer,
      talent
    ]);
  });

  eventEmitter.on("vendorOrderCreated", ({booking, vendorList, skuList})=> {
    dispatchModule.sendEmail("vendorOrderCreated", {booking, skuList}, vendorList);
  }); 
};

module.exports = mailerModule;
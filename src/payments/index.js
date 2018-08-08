function paymentService(instance) {
  const {db, eventEmitter} = instance;
  const paymentPipeline = require("./payment-pipeline.js")({db, eventEmitter});

  eventEmitter.on("booking-offer-accepted", onBookingOfferAccepted);

  function onBookingOfferAccepted(bookingData) {
    console.log("Processing payment...");
    paymentPipeline.processConfirmedBooking(bookingData)
    .then((data)=> { 
      eventEmitter.emit("booking-confirmed", data);
      eventEmitter.emit("outbound-booking-confirmation", data);
    });
  }

  function onError(error) {
    console.error(error);
    return {
      code: "payment:error",
      msg: error.message,
      stack: error.stack.split("\n")
    };
  };
}

module.exports = paymentService;
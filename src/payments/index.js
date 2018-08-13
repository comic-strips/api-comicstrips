function paymentService(instance) {
  const {db, eventEmitter} = instance;
  const paymentProcessor = require("./payment-processor")({db, eventEmitter});
  const errorModule = require("./error.js")({db, eventEmitter});
  const vendorOrderPipeline = require("./vendor-order-pipeline.js")({db});
  const paymentPipeline = require("./payment-pipeline.js")({db, eventEmitter, paymentProcessor, vendorOrderPipeline});

  eventEmitter.on("booking-offer-accepted", onBookingOfferAccepted);

  function onBookingOfferAccepted(bookingData) {
    paymentPipeline.processConfirmedBooking(bookingData)
    .then((data)=> { 
      eventEmitter.emit("booking-confirmed", data);
      eventEmitter.emit("outbound-booking-confirmation", data);
    })
    .catch(onError);
  }

  function onError(error) {
    console.error(error);
    throw error;
  };
}

module.exports = paymentService;
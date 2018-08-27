function paymentPipelineModule($imports) {
  const {db, eventEmitter, paymentProcessor, vendorOrderPipeline} = $imports;
  const {createOrder, createCharge} = paymentProcessor;
  const {createVendorOrder} = vendorOrderPipeline;
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_TEST);

  function processConfirmedBooking(bookingData) {
    console.log("Processing payment...");
    return createOrder(bookingData)
    .then(createCharge)
    .then(createVendorOrder)
    .catch(onError);
  }

  function onError(error) {
   throw error;
  }

  return {processConfirmedBooking};
}

module.exports = paymentPipelineModule;
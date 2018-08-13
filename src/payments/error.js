function paymentErrorModule($imports) {
  const {db, eventEmitter} = $imports;

  eventEmitter.on("found-payment-error", onPaymentError);

  function onPaymentError(errorData) {
    const {booking, ...errorPayload} = errorData; 
    db.collection("issues").push(errorPayload);
  }

}

module.exports = paymentErrorModule;
function paymentErrorModule($imports) {
  const {db, eventEmitter} = $imports;

  eventEmitter.on("found-payment-error", onPaymentError);

  function onPaymentError(errorData) {
    const {booking, ...errorPayload} = errorData; 
    console.error(errorPayload);
    db.collection("issues").push(errorPayload).catch((e)=> console.error("push error:", e));
  }

}

module.exports = paymentErrorModule;
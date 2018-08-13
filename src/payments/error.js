function paymentErrorModule($imports) {
  const {db, eventEmitter} = $imports;

  eventEmitter.on("found-payment-error", onPaymentError);

  function onPaymentError(errorData) {
    const {booking, ...errorPayload} = errorData; 
    console.error(errorPayload);
    db.collection("issues").push(errorPayload)
    .then(onUpdateBookingStatus.bind(null, booking))
    .catch(onError);
  }

  function onUpdateBookingStatus(booking, issueId) {
    db.collection("bookings").update(booking.id, {
      paymentStatus: "PAYMENT-ERR"
    }).catch(onError);
  }

  function onError(e) {
    (e)=> console.error(e);
  }

}

module.exports = paymentErrorModule;
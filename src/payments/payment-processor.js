function paymentProcessor($imports) {
  const {db, eventEmitter} = $imports;
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_TEST);

  function createOrder(data) {
    const promise = new Promise((resolve, reject)=> {
      const options = {
        currency: "usd",
        items: data.booking.products.map(({sku, quantity})=> {
          return {quantity, parent: sku, type: "sku"}
        }),
        email: data.booking.customerEmail
      };

     /* if (process.env.NODE_ENV === "development") {
        onOrder(resolve, data, null, {id: "1q2w3e4r5t6y7u8i9o0"});
      } else {*/
        stripe.orders.create(options, onOrder.bind(null, resolve, reject, data));
      /*}*/
    }).catch(onError);

    return promise;
  }

  function createCharge(data) {
    return db.collection("bookings").update(data.booking.id, {
      "payment_id": data.order.id,
      "paymentStatus": "CHARGED"
    })
    .then(onCharge.bind(null, data))
    .then((booking)=> Object.assign(data, {booking}))
    .catch(onError);
  }

  function onOrder(resolve, reject, data, error, order) {
    if (error) {
      console.error(data, error);
      return
    } 
    resolve(Object.assign(data, {order}));
  }

  function onCharge(data, booking) {
    const promise = new Promise((resolve, reject)=> {
      console.log("Creating charge...");
      stripe.charges.create({
        amount: data.order.amount,
        currency: "usd",
        description: "Example charge",
        //source: data.booking.paymentToken,
      }, onChargeResponse.bind(null, resolve, reject, booking));
      return booking;
    }).catch(onError);

    return promise;
  }

  function onChargeResponse(resolve, reject, booking, error) {
    if (error) {
      const errorData = {
        booking,
        event: "payment-error",
        booking_id: booking.id, 
        code: error.code,
        type: error.rawType,
        msg: error.message,
        stack: error.stack.split("\n")
      };

      eventEmitter.emit("found-payment-error", errorData);
      return reject(errorData);
    }
    resolve(booking);
  }

  function onError(error) {
    const {booking, ...errorData} = error;
    throw errorData;
  }

  return {createOrder, createCharge}
}

module.exports = paymentProcessor;
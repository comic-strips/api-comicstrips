function paymentProcessor($imports) {
  const {db} = $imports;
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

      if (process.env.NODE_ENV === "development") {
        onOrder(resolve, data, null, {id: "1q2w3e4r5t6y7u8i9o0"});
      } else {
        stripe.orders.create(options, onOrder.bind(null, resolve, data));
      }
    });

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

  function onOrder(resolveFn, data, error, order) {
    if (error) {
      onError(error);
    } 
    resolveFn(Object.assign(data, {order}));
  }

  function onCharge(data, booking) {
    console.log("Creating charge...");
    stripe.charges.create({
      amount: data.order.amount,
      currency: "usd",
      description: "Example charge",
      source: data.booking.paymentToken,
    }, onError);
    return booking;
  }

  function onError(error) {
    console.error(error);
  };

  return {createOrder, createCharge}
}

module.exports = paymentProcessor;
function paymentPipelineModule($imports) {
  const {db, eventEmitter} = $imports;
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_TEST);
  
  function processConfirmedBooking(bookingData) {
    console.log("Processing payment...");
    return createOrder(bookingData)
    .then(createCharge)
    .then(buildSkuList)
    .then(getVendorsList)
    .catch(onError);
  }

  function createOrder(data) {
    const promise = new Promise((resolve, reject)=> {
      const options = {
        currency: "usd",
        items: data.booking.products.map(({sku, quantity})=> {
          return {quantity, parent: sku, type: "sku"}
        }),
        email: data.booking.customerEmail
      };

      onOrder(resolve, data, null, {id: "1q2w3e4r5t6y7u8i9o0"});
      //stripe.orders.create(options, onOrder.bind(null, resolve, data));
    });
    return promise;
  }

  function createCharge(data) {
    return db.collection("bookings").update(data.booking.id, {
      "payment_id": data.order.id,
      "paymentStatus": "CHARGED"
    })
    .then((booking)=> {
      console.log("Creating charge...");
      /*stripe.charges.create({
        amount: data.order.amount,
        currency: "usd",
        description: "Example charge",
        source: data.booking.paymentToken,
      });*/
      return Object.assign(data, {booking});
    })
    .catch(onError);
  }

  function onOrder(resolveFn, data, error, order) {
    if (error) {
      onError(error);
    } 
    resolveFn(Object.assign(data, {order}));
  }

  function buildSkuList(data) {
    const skuList = data.booking.products.map((product)=> {
      return db.collection("skus").findById(product.sku)
      .then(([sku])=> Object.assign(sku, {quantity: product.quantity}));
    });
    return Promise.all(skuList).then(list=> Object.assign(data, {skuList: list}));
  }

  function getVendorsList(data) {
    const vendorList = data.skuList.map((sku)=> {
      return db.collection("vendors").findById(sku.vendor_id)
      .then(([vendor])=> vendor)
    });

    return Promise.all(vendorList)
    .then(listToMap)
    .then((vList)=> Object.assign(data, {vendorList: Object.values(vList), skuList: data.skuList}))
  };

  function listToMap(vList) {
    return vList.reduce((vMap, current)=> {
      vMap[current.id] = current;
      return vMap;
    }, {});
  }

  function onError(error) {
    console.error(error);
    return {
      code: "payment:error",
      msg: error.message,
      stack: error.stack.split("\n")
    };
  };

  return {processConfirmedBooking};
}

module.exports = paymentPipelineModule;
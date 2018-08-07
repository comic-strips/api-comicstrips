function paymentService(instance) {
  const {db, eventEmitter} = instance;
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_TEST);

  eventEmitter.on("booking_confirmed", onConfirmedBooking);

  function onConfirmedBooking(bookingData) {
    console.log("Processing payment...");
    createOrder(bookingData)
    .then(buildSkuList)
    .then(getVendorsList)
    .then((data)=> console.log(data));
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

      onOrder(resolve, data, null);
      //stripe.orders.create(options, onOrder.bind(null, resolve, data));
    });
    return promise;
  }

  function onOrder(resolveFn, data, error, order={}) {
    if (error) {
      onError(error);
    } 
    resolveFn(Object.assign(data, {order}));
  }

  function listToMap(vList) {
    return vList.reduce((vMap, current)=> {
      vMap[current.id] = current;
      return vMap;
    }, {});
  }

  function buildSkuList(data) {
    const skuList = data.booking.products.map((product)=> {
      return db.collection("skus").findById(product.sku)
      .then(([sku])=> Object.assign(sku, {quantity: product.quantity}));
    });
    return Promise.all(skuList).then(list=> list);
  }

  function getVendorsList(skuList) {
    const vendorList = skuList.map((sku)=> {
      return db.collection("vendors").findById(sku.vendor_id)
      .then(([vendor])=> vendor)
    });

    return Promise.all(vendorList)
    .then(listToMap)
    .then((vList)=> Object.assign({}, {vendorList: Object.values(vList), skuList}))
  };

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
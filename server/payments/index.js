'use strict';

function paymentsModule(app) {
  const {promisify} = require("util");
  const {Utils} = app;
  const {Skus, Vendors} = app.models;
  const {Events, Meta} = Utils;
  const $Event = Events.$Event;
  const eventEmitter = Events.eventEmitter;
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_TEST);
  const sampleOrder = require("../../common/models/sample-data.json").order;

  eventEmitter.on("bookingConfirmed", (data)=> {
    onOrderCreated(data, null, sampleOrder);

    /*stripe.orders.create({
      currency: "usd",
      items: data.booking.products.map((prod)=> {
        const {sku, ...props} = prod;
        return props;
      }),
      email: data.customer.email
    }, onOrderCreated.bind(null, data));*/
  });

  function buildSkuList(item) {
    return Skus.findById(item.parent)
    .then((sku)=> Object.assign(sku, {quantity: item.quantity}))
    .catch(onError);
  };

  function onOrderCreated(data, error, order) {
    if (error) {
      onError(error);
    } 
    const skuList = sampleOrder.items.filter(item=> item.type === "sku")
    .map(buildSkuList);

    Promise.all(skuList).then((list)=> list)
    .then(getVendorsList)
    .then(({vList, skus})=> {
      eventEmitter.emit("vendorOrderCreated", {
        booking: data.booking,
        vendorList: filterUniqueVendors(vList),
        skuList: skus
      });
    })
    .catch(onError);

    /*const getCardToken = promisify(data.customer.billingInfo);
    data.booking.updateAttribute("payment_id", order.id);
    getCardToken().then((billingInfo)=> billingInfo.token)
    .then((token)=> {
      stripe.charges.create({
        amount: order.amount,
        currency: "usd",
        description: "Example charge",
        source: token,
      });
    })
    .catch(onError);*/
  };

  function getVendorsList(skus) {
    const vendorList = skus.map((sku)=> Vendors.findById(sku.vendor_id));
    return Promise.all(vendorList).then((vList)=> {
      return {vList, skus};
    });
  };

  function filterUniqueVendors(vList) {
    const idList = {};
    return vList.filter((vendor)=> vendor.id !== process.env.ADMIN_ACCT_ID)
    .filter((vendor)=> {
      !idList[vendor.id] ? idList[vendor.id] = 1: idList[vendor.id] = idList[vendor.id] + 1;
      return idList[vendor.id] === 1;
    });
  };

  function onError(error) {
    console.error(error);
    return {
        code: "payment:error",
        msg: error.message,
        stack: error.stack.split("\n")
    };
  };
};

module.exports = paymentsModule;

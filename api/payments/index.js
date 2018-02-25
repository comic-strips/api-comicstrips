function paymentsModule($imports) {
    const { app, utils } = $imports;
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_TEST);
    const eventEmitter = utils.eventEmitter;
    
    eventEmitter.on("payments:createOrder", onCreateOrder);

    function onCreateOrder(orderData) {
        const {email, vendor, entity, attributes} = orderData[0];

        const promise = new Promise((resolve, reject)=> {
            stripe.orders.create({
                currency: "usd",
                items: orderData.map(filterStripeOrderAPIProps),
                email: email
            }, onAPIResponse.bind(null, {vendor, entity, attributes}, resolve));
        })
        return promise;
    };

    function filterStripeOrderAPIProps(order) {
        let {entity, email, vendor, attributes, sku, ...orderDetails} = order;
        return orderDetails;
    };
    
    function onAPIResponse(metadata, resolve, err, order) {
        if (err) {
            onError(error);
        } else {
            resolve({
                email: order.email,
                amount: order.amount,
                created: order.created,
                items: order.items,
                metadata
            });
        }
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

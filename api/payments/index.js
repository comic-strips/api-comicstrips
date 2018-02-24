function paymentsModule($imports) {
    const { app, utils } = $imports;
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_TEST);
    const eventEmitter = utils.eventEmitter;
    
    eventEmitter.on("payments:createOrder", onCreateOrder);

    function onCreateOrder(orderData) {
        const promise = new Promise((resolve, reject)=> {
            stripe.orders.create({
                currency: "usd",
                items: orderData,
                email: "accounts@comicstrips.nyc"
            }, onAPIResponse.bind(null, resolve));
        });
        return promise;
    };
    
    function onAPIResponse(resolve, err, order) {
        if (err) {
            onError(error);
        } else {
            resolve({
                email: order.email,
                amount: order.amount,
                created: order.created,
                items: order.items,
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

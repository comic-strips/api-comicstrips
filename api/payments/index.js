function paymentsModule($imports) {
    const { app, utils } = $imports;
    const eventEmitter = utils.eventEmitter;
    
    eventEmitter.on("payments:createOrder", onCreateOrder);

    function onCreateOrder(orderData) {
        console.log("creating order...", orderData);   
    }
    
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

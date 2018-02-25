function vendorModule($imports) {
        const { app, utils } = $imports;
        const eventEmitter = utils.eventEmitter;
        
        eventEmitter.on("vendor:bookingConfirmed", onBookingConfirmed);

        function onBookingConfirmed(eventData) {
            eventEmitter.emit("db/vendor:bookingConfirmed", eventData);
        };
        
        function onError(error) {
            console.error(error);
            return {
                code: "vendor:error",
                msg: error.message,
                stack: error.stack.split("\n")
            };
        };
};

module.exports = vendorModule;

function mailerModule($imports) {
        const { app, utils } = $imports;
        const eventEmitter = utils.eventEmitter;
        const templateModule = require("./template");
        const dispatchModule = require("./dispatch")({templateModule});

        eventEmitter.on("mailer:bookingConfirmed", onBookingConfirmed);
        eventEmitter.on("mailer:bookingCreated", onBookingCreated);
        eventEmitter.on("mailer:vendorOrderCreated", onVendorOrderCreated);

        function onBookingConfirmed(booking) {
                return eventEmitter
                        .emit("db/mailer:bookingConfirmed", booking.id)
                        .then(dispatchModule.sendEmail.bind(
                                null, 
                                "bookingConfirmed",
                                booking)
                        )
                        .catch(onError);
        };

        function onBookingCreated(eventData) {
                return eventEmitter
                        .emit("db/mailer:onBookingCreated", eventData.payload.customerId)
                        .then((customer)=> {
                                dispatchModule.sendEmail(
                                        "bookingCreated",
                                        eventData.payload,
                                        [customer]
                                );
                                return eventData;
                        })
                        .catch(onError);
        };

        function onVendorOrderCreated(data) {
                console.log(data);
        };

        function onError(error) {
                console.error(error);
                return {
                        code: "mailer:error",
                        msg: error.message,
                        stack: error.stack.split("\n")
                };
        };
}

module.exports = mailerModule;

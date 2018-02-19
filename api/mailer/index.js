function mailerModule($imports) {
        const { app, utils } = $imports;
        const eventEmitter = utils.eventEmitter;
        const templateModule = require("./template");
        const dispatchModule = require("./dispatch")({templateModule});

        eventEmitter.on("mailer:bookingConfirmed", onBookingConfirmed);
        eventEmitter.on("mailer:bookingCreated", onBookingCreated);

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

        function onBookingCreated(booking) {
                return eventEmitter
                        .emit("db/mailer:onBookingCreated", booking.customerId)
                        .then((customer)=> {
                                dispatchModule.sendEmail(
                                        "bookingCreated",
                                        booking,
                                        [customer]
                                );
                                return booking;
                        })
                        .catch(onError);
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

function mailerModule($imports) {
        const { app, utils } = $imports;
        const eventEmitter = utils.eventEmitter;
        const templateModule = require("./template");
        const dispatchModule = require("./dispatch")({templateModule});

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

        function onBookingCreated(bookingData) {
                const { bookingId, booking } = bookingData

                return eventEmitter
                        .emit("db/mailer:onBookingCreated", 
                                booking.bookingData.customerId)
                        .then((customer)=> {
                                dispatchModule.sendEmail(
                                        "bookingCreated",
                                        bookingData,
                                        [customer.email]
                                );
                                return bookingData;
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

        eventEmitter.on("mailer:bookingConfirmed", onBookingConfirmed);
        eventEmitter.on("mailer:bookingCreated", onBookingCreated);
}

module.exports = mailerModule;

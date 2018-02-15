function mailerModule($imports) {
        const { app, utils } = $imports;
        const eventEmitter = utils.eventEmitter;
        const templateModule = require("./template")();
        const dispatchModule = require("./dispatch")({
                templateModule,
                mode: process.env.NODE_ENV
        });

        function onBookingConfirmed({ bookingId }) {
                eventEmitter
                        .emit("db/mailer:onBookingConfirmed", bookingId)
                        .then(
                                dispatchModule.sendBatchEmail.bind(
                                        null,
                                        bookingId
                                )
                        )
                        .catch(onError);
        }

        function onBookingCreated() {}

        function onError(error) {
                console.error(error);
                return {
                        code: "mailer:error",
                        msg: error.message,
                        stack: error.stack.split("\n")
                };
        }

        eventEmitter.on("mailer:bookingConfirmed", onBookingConfirmed);
        eventEmitter.on("mailer:bookingCreated", onBookingCreated);
}

module.exports = mailerModule;

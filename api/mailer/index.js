function mailerModule($imports) {
        const { app, utils } = $imports;
        const eventEmitter = utils.eventEmitter;
        const dispatchModule = require("./dispatch")();
        const config = require("./mailer.json");


        function onBookingConfirmed({ bookingId }) {
                const confirmationEmailConfig = {
                        from: config.senders.bookingConfirmation,
                        subject: `Booking Request Acknowledged`,
                        html: `<h1> Received Booking Request ${bookingId}</h1>`
                };
                eventEmitter
                        .emit("db/mailer:onBookingConfirmed", bookingId)
                        .then(
                                dispatchModule.sendEmail.bind(
                                        null,
                                        confirmationEmailConfig
                                )
                        )
                        .catch(onError);
        }

        function onBookingCreated({ bookingId, booking}) {
                /* configure email here 
                        dispatchModule.sendEmail.bind({
                                from: defaultSender,
                                subject: `Booking Request Acknowledged`
                                html: `<h1> Received Booking Request ${bookingId}</h1>`
                        })
                */
                console.log("bookingCreated:", {bookingId, booking})
        }

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

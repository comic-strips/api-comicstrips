function mailerModule($imports) {
        const { app, utils } = $imports;
        const eventEmitter = utils.eventEmitter;
        const dispatchModule = require("./dispatch")();
        const config = require("./mailer.json");


        function onBookingConfirmed({ bookingId }) {
                const confirmationEmailConfig = {
                        from: config.senders.bookingConfirmation,
                        subject: "Booking Confirmed",
                        html: `<h1> Booking ${bookingId} is Confirmed!</h1>`,
                        messageType: "bookingConfirmation"
                };

               return eventEmitter
                        .emit("db/mailer:bookingConfirmed", bookingId)
                        .then(
                                dispatchModule.sendEmail.bind(
                                        null,
                                        confirmationEmailConfig
                                )
                        )
                        .catch(onError);
        }

        function onBookingCreated(bookingData) {
                const { bookingId, booking } = bookingData
                const bookingCreatedEmailConfig = {
                        from: config.senders.bookingCreated,
                        subject: "Booking Request Acknowledged",
                        html: `<h1> Received Booking Request ${bookingId}</h1>
                        <p>We're on it!</p>`,
                        messageType: "bookingCreated"
                };

                return eventEmitter
                        .emit("db/mailer:onBookingCreated", 
                                booking.bookingData.customerId)
                        .then((customer)=> {
                                dispatchModule.sendEmail(bookingCreatedEmailConfig, 
                                        [customer.email]
                                );
                                return bookingData;
                        })
                        .catch(onError);
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

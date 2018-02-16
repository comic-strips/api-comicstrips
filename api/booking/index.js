function bookingModule($imports) {
        const { app, utils } = $imports;
        const eventEmitter = utils.eventEmitter;

        app.post("/api/v1/bookings/create", (request, response) => {
                eventEmitter
                        .emit("db/account:requestAcctManager", request.body)
                        .then(onAccountManagerAssigned)
                        .then(onBookingCreated.bind(null, response))
                        .then(notifyTalent)
                        .catch(onError);
        });

        function onAccountManagerAssigned(booking) {
                return eventEmitter.emit("db/booking:createBooking", booking);
        };

        function onBookingCreated(response, data) {
                if (!data.code) {
                    response.json({bookingId: data.bookingId});
                    return data;
                }
                response.status(500).json(data);
        };

        function notifyTalent(booking) {
               return eventEmitter.emit("db/talent:bookingCreated", booking)
               .catch(onError)
               .then((booking)=> {
                        return eventEmitter
                                .emit("mailer:bookingCreated", booking)
                                .catch(onError);
               })
               .then((booking)=> console.log(booking))
        }

        function onError(error) {
                console.error(error);
                return {
                        code: "booking:error",
                        msg: error.message,
                        stack: error.stack.split("\n")
                };
        }
}

module.exports = bookingModule;

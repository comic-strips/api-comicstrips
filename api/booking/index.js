function bookingModule($imports) {
        const { app, utils } = $imports;
        const eventEmitter = utils.eventEmitter;
        const $Event = new utils.EventFactory({
        	type: "booking-event", 
        	source: "bookingModule"
        });

        app.post("/api/v1/bookings/create", (request, response)=> {
                eventEmitter
		.emit("db/account:requestAcctManager", 
			new $Event(request.body)
		)
		.then(onAccountManagerAssigned)
		.then(onBookingCreated.bind(null, response))
		.then(notifyTalent)
		.catch(onError);
        });

        function onAccountManagerAssigned(eventData) {
                return eventEmitter.emit("db/booking:createBooking", eventData);
        };

        function onBookingCreated(response, eventData) {
                if (!eventData.code) {
			response.json({bookingId: eventData.payload.id});
			return eventData;
                }
                response.status(500).json(eventData);
        };

        function notifyTalent(eventData) {
               return eventEmitter.emit("db/talent:bookingCreated", eventData)
               .catch(onError)
               .then((eventData)=> {
                        return eventEmitter
                                .emit("mailer:bookingCreated", eventData)
                                .catch(onError);
               })
               .then((eventData)=> eventData);
        };

        function onError(error) {
                console.error(error);
                return {
                        code: "booking:error",
                        msg: error.message,
                        stack: error.stack.split("\n")
                };
        };
};

module.exports = bookingModule;

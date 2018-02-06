
function bookingModule($imports) {
	const {app, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
     	const bookingId = "-L4dH55siqby7ecSnHFq";
	
	app.post("/api/v1/bookings/create", (request, response)=> {
		eventEmitter.emit("accounts:requestAcctManager", request.body)
		.then((booking)=> {
			eventEmitter.emit("db:createBooking", booking)
			.then((data)=> {
				if (!data.code) {
					response.json({
						bookingId: data.bookingId
					});
					return data;
				}
				response.status(500).json(data);
			})
			.then(onBookingCreated)
			.catch(onError);
		}).catch(onError); 
	});

	function onBookingCreated({bookingId, booking}) {
		eventEmitter.emit("mailer:bookingCreated", bookingId);
		eventEmitter.emit("talent:publishBookingOffer", {bookingId, booking});
		eventEmitter.emit("db:requestBookingTalent", bookingId);
		return Promise.resolve();
	};

	function onError(error) {
		console.error(error);
		return {
			code: "booking/error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	};
}

module.exports = bookingModule;
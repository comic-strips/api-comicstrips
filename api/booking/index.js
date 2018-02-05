
function bookingModule($imports) {
	const {app, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
	
	app.post("/api/v1/booking/create", (request, response)=> {
		eventEmitter.emit("accounts:requestAcctManager", request.body)
		.then((booking)=> {
			eventEmitter.emit("db:createBooking", booking)
			.then((data)=> {
				if (!data.code) {
					response.json({bookingId: data});
					return;
				}
				response.status(500).json(data);
			}).catch(onError);
		}).catch(onError)
	});

	function onError(error) {
		console.error(error);
		return {
			code: "booking/error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	}
}

module.exports = bookingModule;
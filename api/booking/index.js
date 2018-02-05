
function bookingModule($imports) {
	const {app, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
	
	app.post("/api/v1/booking/create", (request, response)=> {
		eventEmitter.emit("db:createBooking", request.body)
		.then(bookingId=> {
			response.json({bookingId});
		}).catch(onError);
	});

	function onError(error) {
		console.error(error);
		return error;
	}
}

module.exports = bookingModule;
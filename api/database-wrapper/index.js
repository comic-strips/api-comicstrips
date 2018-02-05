function databaseWrapper($imports) {
	const {utils} = $imports;
	const eventEmitter = utils.eventEmitter;

	eventEmitter.on("db:createBooking", (bookingData)=> {
		return {bookingData};
	});

}


module.exports = databaseWrapper;

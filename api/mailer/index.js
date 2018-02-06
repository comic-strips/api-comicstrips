function mailerModule($imports) {
	const {app, utils} = $imports;
	const eventEmitter = utils.eventEmitter;

	function onBookingCreated(bookingId) {
		//console.log("send confirmation for:", bookingId);
	}

	eventEmitter.on("mailer:bookingCreated", onBookingCreated);
}

module.exports = mailerModule;

function mailerModule($imports) {
	const {app, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
	const dispatchModule = require("./dispatch")({
		mode: process.env.NODE_ENV
	});

	function onBookingConfirmed({bookingId}) {
		eventEmitter.emit("db/mailer:onBookingConfirmed", bookingId)
		.then(dispatchModule.sendBatchEmail); 
	}

	function handleBatchConfirmationEmails(ids, snapshot, record) {
		
		
	}

	function onBookingCreated() {

	}

	eventEmitter.on("mailer:bookingConfirmed", onBookingConfirmed);
	eventEmitter.on("mailer:bookingCreated", onBookingCreated);
}

module.exports = mailerModule;

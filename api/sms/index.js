function SMSModule($imports) {
	const twilio = require("twilio");
	const mockData = require("./mock/index.json");
	const config = require("./message-templates.json");
	const accountSID = process.env.TWILIO_SID;
	const authToken = process.env.TWILIO_AUTH_TOKEN;
	const twilioNumber = process.env.TWILIO_NUMBER;
	const client = new twilio(accountSID, authToken);
	const {app, auth, db, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
	const ejs = require("ejs");

	app.post("/api/v1/booking-offer", (request, response)=> {
		/*check to see if booking offer is already accepted.*/
		if (!request.body.Body.includes("ACCEPT")) {
			response.json({
				code: "sms/offer-declined",
				message: "The booking offer was declined."
			});
			return;
		}	

		parseOfferResponse({
			messsageBody: request.body.Body,
			from: request.body.From
		}).then((data)=> response.json({bookingId: data}));
	});

	function buildSMSTemplate(template, data) {
		return ejs.render(template, {data});
	}

	function onSendNotifications({booking, bookingId, contactList}) {
		contactList.forEach((contact)=> {
			client.messages.create({
				body: buildSMSTemplate(config.bookingOfferOutgoingMsg, {
					booking,
					bookingId,
					contact
				}),
				to: contact.phoneNumber,  
				from: twilioNumber
			})
			.then(/*(message)=> console.log(message.sid)*/)
			.catch(onError);
		});
	};

	function parseOfferResponse({messsageBody, from}) {
		const [, bookingRefNumber] = messsageBody.split(" ");
		const talentPhoneNumber = from;

		return eventEmitter.emit("db:finalizeBooking", {
			bookingRefNumber: parseInt(bookingRefNumber),
			talentPhoneNumber
		});
	}

	function onError(error) {
		console.error(error);
		return {
			code: "sms/error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	};

	eventEmitter.on("sms:sendNotifications", onSendNotifications);
}

module.exports = SMSModule;
function SMSModule($imports) {
	const twilio = require("twilio");
	const message = require("./templates/talent/booking-offer-sms.json");
	const accountSID = process.env.TWILIO_SID;
	const authToken = process.env.TWILIO_AUTH_TOKEN;
	const twilioNumber = process.env.TWILIO_NUMBER;
	const client = new twilio(accountSID, authToken);
	const { app, utils } = $imports;
	const { eventEmitter } = utils;
	const ejs = require("ejs");
	const $Event = new utils.EventFactory({
        	type: "sms-event", 
        	source: "smsModule"
        });

	eventEmitter.on("sms:contactListCreated", onContactListCreated);

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
		})
		.then((booking)=> {
			response.json({ bookingId: booking.id });
			return booking;
		})
		.then((booking)=> {
		       return eventEmitter.emit("mailer:bookingConfirmed",booking);
		})
		.catch(onError);
	});

	function buildSMSMessage(template, data) {
		return ejs.render(template, { data });
	};

	function onContact(booking, contact) {
		client.messages.create(Object.assign({}, {
			body: buildSMSMessage(message.body, {
				booking,
				contact
			}),
			to: contact.phoneNumber,
			from: twilioNumber
		})).catch(onError);
	};

	function onContactListCreated({eventData, contactList}) {
		contactList.forEach(onContact.bind(null, eventData.payload));
		return eventData;
	};

	function parseOfferResponse({ messsageBody, from }) {
		const [, bookingRefNumber] = messsageBody.split(" ");
		const talentPhoneNumber = from;

		return eventEmitter.emit("db/booking:finalizeBooking", 
			new $Event({
				bookingRefNumber: parseInt(bookingRefNumber,0), 
				talentPhoneNumber
			}));
	};

	function onError(error) {
		console.error(error);
		return {
			code: "sms:error",
			msg: error.message,
			stack: error.stack.split("\n")
		};
	};
}

module.exports = SMSModule;

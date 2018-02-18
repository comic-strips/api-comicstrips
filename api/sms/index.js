function SMSModule($imports) {
        const twilio = require("twilio");
        const config = require("./message-templates.json");
        const accountSID = process.env.TWILIO_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioNumber = process.env.TWILIO_NUMBER;
        const client = new twilio(accountSID, authToken);
        const { app, utils } = $imports;
        const { eventEmitter } = utils;
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

        function onContact(messageBody, contact) {
                client.messages.create(Object.assign({}, {
                        body: messageBody,
                        to: contact.phoneNumber,
                        from: twilioNumber
                })).catch(onError);
        };

        function onContactListCreated({ booking, bookingId, contactList }) {
                const {bookingOfferOutgoingMsg} = config;
                const messageBody = buildSMSMessage(bookingOfferOutgoingMsg, {
                        booking,
                        bookingId,
                        contact
                });

                contactList.forEach(onContact.bind(null, messsageBody));
                return { booking, bookingId };
        }

        function parseOfferResponse({ messsageBody, from }) {
                const [, bookingRefNumber] = messsageBody.split(" ");
                const talentPhoneNumber = from;

                return eventEmitter.emit("db/booking:finalizeBooking", {
                        bookingRefNumber: parseInt(bookingRefNumber, 0),
                        talentPhoneNumber
                });
        }

        function onError(error) {
                console.error(error);
                return {
                        code: "sms:error",
                        msg: error.message,
                        stack: error.stack.split("\n")
                };
        }

        eventEmitter.on("sms:contactListCreated", onContactListCreated);
}

module.exports = SMSModule;

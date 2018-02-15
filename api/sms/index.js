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
                        eventEmitter.emit("mailer:bookingConfirmed", {
                                bookingId: booking.id
                        });
                })
                .catch(onError);
        });

        function buildSMSTemplate(template, data) {
                return ejs.render(template, { data });
        }

        function sendBookingOffers({ booking, bookingId, contactList }) {
                contactList.forEach((contact)=> {
                        client.messages
                                .create({
                                        body: buildSMSTemplate(
                                                config.bookingOfferOutgoingMsg,
                                                {
                                                        booking,
                                                        bookingId,
                                                        contact
                                                }
                                        ),
                                        to: contact.phoneNumber,
                                        from: twilioNumber
                                })
                                .catch(onError);
                });
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

        eventEmitter.on("sms:onBookingCreated", sendBookingOffers);
}

module.exports = SMSModule;

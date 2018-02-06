
function bookingModule($imports) {
	const {app, utils} = $imports;
	const eventEmitter = utils.eventEmitter;

	/*const booking =  { 
		bookingData: { 
			recipientId: 'NOT/ISSUED',
		        customerId: 'E8sFGm7u9tSNTGD9e25DWhtDAmx1',
		        talentId: 'NOT/ISSUED',
		        accountManagerId: '3WDebwKtgmSA25CrYRtkA6FMIxD2',
		        transactionId: null,
		        bookingCreationDate: 1517889815160,
		        status: 'PENDING',
		        paymentStatus: 'HELD',
		        customizations: 'Make it extra special.',
		        products: ["Array"],
		        time: '15:00',
		        date: 123456780000,
		        location: ["Object"],
		        notes: 'To be or not be. That is the question.' 
		},
	     	recipientData: { 
	     		customerId: 'E8sFGm7u9tSNTGD9e25DWhtDAmx1',
	        	firstName: 'Jackie',
	        	lastName: 'Robinson',
	        	email: 'jackie@dodgers.la',
	        	phoneNumber: '1-800-SAFE-AUTO',
	        	bookings: ["Array"] 
	        }
     	};*/

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

		//onBookingCreated({bookingId, booking});
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
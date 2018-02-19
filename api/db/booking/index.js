function dbBookingModule($imports) {
	const {utils, db, auth} = $imports;
	const snapshotToArray = utils.snapshotToArray;
	const eventEmitter = utils.eventEmitter;
	const onSubtreeIdListUpdate = utils.onSubtreeIdListUpdate;
	const finalizeModule = require("./finalize")(Object.assign($imports, {utils}));
	const subTree = process.env.NODE_ENV;

	eventEmitter.on("db/booking:finalizeBooking", data=> finalizeModule.finalize(data));

	eventEmitter.on("db/booking:createBooking", (booking)=> {
		return pushBookingData(booking) 
		.then(appendRecipientIdToBooking)
		.then(appendBookingIdToAccountManager)
		.then(appendBookingIdToCustomer)
		.catch(onError);
	});

	function pushBookingData(booking) {
		booking.bookingCreationDate = new Date().getTime();
		booking.bookingRefNumber = Math.floor(Math.random() * 90000) + 10000;
		const {recipientData, ...bookingDetails} = booking;
		return db.ref(`${subTree}/bookings`).push(bookingDetails)
		.then((ref)=> {
			booking.recipientData.bookings.push(ref.key);
			return Object.assign(booking, {id: ref.key});
		}).catch(onError);
	};

	function appendRecipientIdToBooking(booking) {
		return db.ref(`${subTree}/recipients`).push(booking.recipientData)
		.then((ref)=> {
			return db.ref(`${subTree}/bookings/${booking.id}`)
			.update({recipientId: ref.key})
			.then(()=> {
				return db.ref(`${subTree}/meta`)
				.update({[ref.key]: {entity: "recipient"}});
			})
			.then(()=> booking);
		}).catch(onError);
	};

	function appendBookingIdToAccountManager(booking) {
	/* MAKE DRY: SAME AS appendBookingIdToCustomer */
		const accountManagerRef = db.ref(`${subTree}/accountManagers/${booking.accountManagerId}/bookingsPending`);

		return accountManagerRef.once("value")
		.then(onSubtreeIdListUpdate.bind(null, accountManagerRef, booking.id))
		.then(()=> booking);
	};

	function appendBookingIdToCustomer(booking) {
	/* MAKE DRY: SAME AS appendBookingIdToAccountManager*/
		const customerId = booking.customerId;
		const customerRef = db.ref(`${subTree}/customers/${customerId}/bookings`);
		db.ref(`${subTree}/meta`).update({
			[customerId]: {entity: "customer"}
		});

		return customerRef.once("value")
		.then(onSubtreeIdListUpdate.bind(
			null, 
			customerRef, 
			booking.id
		))
		.then(()=> booking);
	};

	function onError(error) {
		console.error(error);
		return {
			code: "db/error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	};

	function onFindUser(talentPhone, user) {
		return user.phoneNumber === talentPhone;
	};

	function findingPendingBooking(data, booking){
		return booking.bookingRefNumber === data.bookingRefNumber && booking.status === "PENDING";
	};
}

module.exports = dbBookingModule;

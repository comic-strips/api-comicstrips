function dbBookingModule($imports) {
	const {utils, db, auth} = $imports;
	const snapshotToArray = utils.snapshotToArray;
	const eventEmitter = utils.eventEmitter;
	const onSubtreeIdListUpdate = utils.onSubtreeIdListUpdate;
	const finalizeModule = require("./finalize")(Object.assign($imports, {utils
	}));
	const subTree = process.env.NODE_ENV;

	eventEmitter.on("db/booking:finalizeBooking", data=> finalizeModule.finalize(data));

	eventEmitter.on("db/booking:createBooking", (eventData)=> {
		return pushBookingData(eventData) 
		.then(appendRecipientIdToBooking)
		.then(appendBookingIdToAccountManager)
		.then(appendBookingIdToCustomer)
		.catch(onError);
	});

	function pushBookingData(evt) {
		evt.payload.bookingCreationDate = new Date().getTime();
		evt.payload.bookingRefNumber = Math.floor(Math.random() * 90000) + 10000;
		const {recipientData, ...bookingDetails} = evt.payload;
		return db.ref(`${subTree}/bookings`).push(bookingDetails)
		.then((ref)=> {
			evt.payload.recipientData.bookings.push(ref.key);
			evt.payload.id = ref.key;
			return evt;
		}).catch(onError);
	};

	function appendRecipientIdToBooking(evt) {
		return db.ref(`${subTree}/recipients`).push(evt.payload.recipientData)
		.then((ref)=> {
			return db.ref(`${subTree}/bookings/${evt.payload.id}`)
			.update({recipientId: ref.key})
			.then(()=> {
				return db.ref(`${subTree}/meta/recipients`)
				.update({[ref.key]: {entity: "recipient"}});
			})
			.then(()=> evt);
		}).catch(onError);
	};

	function appendBookingIdToAccountManager(evt) {
	/* MAKE DRY: SAME AS appendBookingIdToCustomer */
		const accountManagerRef = db.ref(`${subTree}/accountManagers/${evt.payload.accountManagerId}/bookingsPending`);

		return accountManagerRef.once("value")
		.then(onSubtreeIdListUpdate.bind(null, accountManagerRef, evt.payload.id))
		.then(()=> evt);
	};

	function appendBookingIdToCustomer(evt) {
	/* MAKE DRY: SAME AS appendBookingIdToAccountManager*/
		const customerId = evt.payload.customerId;
		const customerRef = db.ref(`${subTree}/customers/${customerId}/bookings`);
		db.ref(`${subTree}/meta/customers`).update({
			[customerId]: {entity: "customer"}
		});

		return customerRef.once("value")
		.then(onSubtreeIdListUpdate.bind(
			null, 
			customerRef, 
			evt.payload.id
		))
		.then(()=> evt);
	};

	function onError(error) {
		console.error(error);
		return {
			code: "db/error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	};
}

module.exports = dbBookingModule;

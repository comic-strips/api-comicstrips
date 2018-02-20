function dbFinalizeModule($imports) {
	const {db, auth, utils} = $imports;
	const {snapshotToArray, onSubtreeIdListUpdate, onSubtreeIdListRemove, EventFactory, eventEmitter } = utils;
	const $Event = new EventFactory({
        	type: "finalize-event", 
        	source: "dbFinalizeModule"
        })
	const subTree = process.env.NODE_ENV;

	function updatePaymentStatus(talentId, bookingsRef, booking) {
		bookingsRef.child(`${booking.id}`).update({
			status: "CONFIRMED",
			paymentStatus: "CHARGED",
			talentId
		});

		const talentRef = db.ref(`${subTree}/talent`)
		.child(`${talentId}/bookings`);

		return talentRef.once("value")
		.then(onSubtreeIdListUpdate.bind(null, talentRef, booking.id))
		.then(()=> {
			return updateAcctManagerBookingsConfirmed(
				Object.assign(booking, {
					status: "CONFIRMED",
					paymentStatus: "CHARGED",
					talentId
				}
			));
		});
	};

	function onFindUser(talentPhone, user) {
		return user.phoneNumber === talentPhone;
	};

	function findPendingBooking(eventData, booking) {
		return booking.bookingRefNumber === eventData.payload.bookingRefNumber && booking.status === "PENDING";
	};

	function updateAcctManagerBookingsConfirmed(booking) {
		const acctManagersRef = db.ref(`${subTree}/accountManagers`);
		const bookingsConfirmedRef = acctManagersRef.child(`${booking.accountManagerId}/bookingsConfirmed`);
		const bookingsPendingRef = acctManagersRef.child(`${booking.accountManagerId}/bookingsPending`);

		return bookingsConfirmedRef.once("value")
		.then(onSubtreeIdListUpdate.bind(null, bookingsConfirmedRef, booking.id))
		.then(()=> {
			return bookingsPendingRef.once("value")
			.then(onSubtreeIdListRemove.bind(null, bookingsPendingRef, booking.id));	
		})
		.then(()=> booking);
	};

	function finalize(eventData) {
		/*payment happens during this phase*/

		return auth.listUsers().then((list)=> {
			const talentId = list.users.find(onFindUser.bind(null, eventData.payload.talentPhoneNumber)).toJSON().uid;
			const bookingsRef = db.ref(`${subTree}/bookings`);

			/* TODO: TALENT CREATION MODULE */
			db.ref(`${subTree}/meta/talent`).update({
				[talentId]: {entity: "talent"}
			});

			return bookingsRef.orderByChild("bookingRefNumber")
			.once("value")
			.then((snapshot)=> {
				return snapshotToArray(snapshot)
				.find(findPendingBooking.bind(null, eventData));
			})
			.then(updatePaymentStatus.bind(null, talentId, bookingsRef))
			.then((booking)=> {
				return eventEmitter.emit(
					"db/vendor:finalizeVendors", 
					new $Event(booking)
				);
			})
			.catch(onError)
		});
	};

	function onError(error) {
		console.error(error);
		return {
			code: "db/error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	};

	return {finalize};
}

module.exports = dbFinalizeModule;

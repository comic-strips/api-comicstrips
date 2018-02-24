function dbMailerModule($imports) {
	const {app, auth, db, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
	const subTree = process.env.NODE_ENV;
	const allowedKeys = ["customerId", "accountManagerId", "talentId"];
	const entityKeyMap = {
		customerId: "customers",
		accountManagerId: "accountManagers",
		talentId: "talent" 
	}

	eventEmitter.on("db/mailer:bookingConfirmed", onBookingConfirmed);
	eventEmitter.on("db/mailer:onBookingCreated", onBookingCreated);

	function onBookingConfirmed(bookingId) {
		return db.ref(`${subTree}/bookings/${bookingId}`)
		.once("value")
		.then(snapshot=> snapshot.val())
		.then(onBookingData)
		.then(onUserIdList)
		.then((userList)=> {
			return Promise.all(userList)
			.then(userList=> userList)
			.catch(onError);
		})
		.catch(onError);
	};

	function onBookingData(bookingData) {
		return Object.keys(bookingData)
		.filter(key=> allowedKeys.includes(key))
		.map(key=> Object.assign({}, {userId: bookingData[key], key}))
	};

	function onUserIdList(userIdList) {
		return userIdList.map(onUserId)
	};

	function onUserId({userId, key}) {
		const metadataRef = db.ref(`${subTree}/meta/`);
		return auth.getUser(userId)
		.then(userRecord=> userRecord.toJSON())
		.then((userRecord)=> {
			return metadataRef
			.child(`${entityKeyMap[key]}/${userRecord.uid}`)
			.once("value")
			.then(snapshot=> snapshot.val())
			.then(entity=> Object.assign(userRecord, entity));
		});
	};

	function onBookingCreated(customerId) {
		return auth.getUser(customerId)
		.then((userRecord)=> userRecord.toJSON())
		.then((userRecord)=> {
			return db.ref(`${subTree}/meta/customers/${customerId}/entity`)
			.once("value")
			.then((snapshot)=> {
				return Object.assign(userRecord, {
					entity: snapshot.val()
				});
			});
		});
	};

	function onError(error) {
		console.error(error);
		return {
			code: "db/mailer:error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	};
}

module.exports = dbMailerModule;

function dbMailerModule($imports) {
	const {app, auth, db, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
	const subTree = process.env.NODE_ENV;
	const allowedKeys = ["customerId", "accountManagerId", "talentId"];

	eventEmitter.on("db/mailer:bookingConfirmed", onBookingConfirmed);
	eventEmitter.on("db/mailer:onBookingCreated", onBookingCreated);

	function onBookingConfirmed(bookingId) {
		return db.ref(`${subTree}/bookings/${bookingId}`).once("value")
		.then(snapshot=> snapshot.val())
		.then(onBookingData)
		.then((userList)=> {
			return Promise.all(userList)
			.then(onUsersList)
			.catch(onError);
		})
		.catch(onError);
	};

	function onUsersList(records) {
		return db.ref(`${subTree}/meta/`).orderByChild("entity")
		.once("value")
		.then((snapshot)=> {
			return Object.values(snapshot.val())
			.reduce((prevObj, currObj)=> {
				return Object.assign(prevObj, currObj);
			}, {}); 
		})
		.then((userMetadata)=> {
			return records.map((user)=> {
				return Object.assign(user, {
					entity: userMetadata[user.uid].entity
				});
			});
		});
	};

	function onBookingData(bookingData) {
		return Object.keys(bookingData)
		.filter(key=> allowedKeys.includes(key))
		.map(key=> bookingData[key])
		.map(userId=> {
			return auth.getUser(userId)
			.then(userRecord=> userRecord.toJSON());
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

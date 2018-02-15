function dbMailerModule($imports) {
	const {app, auth, db, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
	const subTree = process.env.NODE_ENV;

	eventEmitter.on("db/mailer:onBookingConfirmed", onBookingConfirmed);
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
		const userMetadata = records.map((user)=> {
			return db.ref(`${subTree}/meta/${user.uid}/entity`)
			.once("value")
			.then(snapshot=> {  
				return Object.assign(user, {
					entity: snapshot.val()
				});
			});
		});
		return Promise.all(userMetadata);
	};

	function onBookingData(bookingData) {
		return Object.keys(bookingData)
		.filter(key=> key.includes("Id") && key !== "recipientId")
		.map(key=> bookingData[key])
		.map(userId=> {
			return auth.getUser(userId)
			.then(userRecord=> userRecord.toJSON());
		});
	};

	function onBookingCreated(customerId) {
		return auth.getUser(customerId)
		.then((userRecord)=> userRecord.toJSON());
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

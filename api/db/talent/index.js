function dbTalentModule($imports) {
	const {app, auth, db, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
	const subTree = process.env.NODE_ENV;
	const snapshotToArray = utils.snapshotToArray;

	eventEmitter.on("db/talent:bookingCreated", onBookingCreated);

	function getAvailableTalent(talentList) {
	/* SOME LOGIC TO DETERMINE AVAILABILITY; SCHEDULING MODULE LIKELY COMES INTO PLAY HERE.*/
		return [talentList[0].id];
	}

	function buildContactList(talentIdList) {
		const contactList = talentIdList.map((id) => {
			return auth.getUser(id).then(user=> user.toJSON())
		});

		return Promise.all(contactList).catch(onError);	
	};

	function onBookingCreated(eventData) {
		return db.ref(`${subTree}/talent`).once("value")
		.then((snapshot)=> snapshotToArray(snapshot))
		.then(getAvailableTalent)
		.then(buildContactList)
		.then((contactList)=> {
			return eventEmitter.emit("sms:contactListCreated", {
				eventData,
				contactList
			})
			.catch(onError);
		}).catch(onError);
	};

	function onError(error) {
		console.error(error);
		return {
			code: "db/talent:error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	};
};

module.exports = dbTalentModule;

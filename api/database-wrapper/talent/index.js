function dbTalentModule($imports) {
	const {app, auth, db, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
	const subTree = process.env.NODE_ENV;
	const snapshotToArray = utils.snapshotToArray;

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

	function onBookingCreated({bookingId, booking}) {
		return db.ref(`${subTree}/talent`).once("value")
		.then((snapshot)=> snapshotToArray(snapshot))
		.then(getAvailableTalent)
		.then(buildContactList)
		.then((contactList)=> {
			eventEmitter.emit("sms:onBookingCreated", {
				bookingId, 
				booking,
				contactList
			});
		});
	};

	function onError(error) {
		console.error(error);
		return {
			code: "databaseWrapper/error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	};

	eventEmitter.on("db/talent:bookingCreated", onBookingCreated);
};

module.exports = dbTalentModule;

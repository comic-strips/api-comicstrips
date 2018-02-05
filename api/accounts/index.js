function accountModule($imports) {
	const {db, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
	const snapshotToArray = utils.snapshotToArray;
	const subTree = process.env.NODE_ENV;

	eventEmitter.on("accounts:requestAcctManager", onRequestAcctManager);

	function onRequestAcctManager(booking) {
		return assignAcctManager().then((acctManagerId)=> {
			return db.ref(`${subTree}/accountManagers/${acctManagerId}`)
			.once("value")
			.then((snapshot)=> {
				const acctManagerId = snapshot.key;
				const accountManagerData = snapshot.val();
				booking.bookingData.accountManagerId = acctManagerId;
				return booking;
			}).catch(onError);
		}).catch(onError);
	};

	function assignAcctManager() {
		return db.ref(`${subTree}/accountManagers`).once("value")
		.then((snapshot)=> {
			const accountManagersList = snapshotToArray(snapshot)
			.filter((accountManager)=> {
				if (Array.isArray(accountManager.bookingsPending)) {
					return accountManager.bookingsPending.length < 3;
				}
				return accountManager.bookingsPending < 3;
			});
			return randomlySelectAcctManager(accountManagersList);
		}).catch(onError);
	};

	function randomlySelectAcctManager(accountManagersList) {
		return accountManagersList[0].id;
	}

	function onError(error) {
		console.error(error);
		return {
			code: "accounts/error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	}
}

module.exports = accountModule;
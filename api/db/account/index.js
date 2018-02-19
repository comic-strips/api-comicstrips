function dbAccountModule($imports) {
	const {db, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
	const snapshotToArray = utils.snapshotToArray;
	const subTree = process.env.NODE_ENV;

	eventEmitter.on("db/account:requestAcctManager", requestAcctManager);

	function requestAcctManager(booking) {
		return assignAcctManager().then((acctManagerId)=> {
			db.ref(`${subTree}/meta/accountManagers`).update({
				[acctManagerId]: {entity: "accountManager"}
			})
			return db.ref(`${subTree}/accountManagers/${acctManagerId}`)
			.once("value")
			.then(onAccountManager.bind(null, booking))
			.catch(onError);
		}).catch(onError);
	};

	function onAccountManager(booking, dbsnapshot) {
		const acctManagerId = dbsnapshot.key;
		booking.accountManagerId = acctManagerId;
		return booking;
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
		/*logic to randomly select from available account managers here.*/
		if (accountManagersList.length === 0) {
			throw "accountManagersList is empty."
		}
		return accountManagersList[0].id;
	}

	function onError(error) {
		console.error(error);
		return {
			code: "db/error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	}
}

module.exports = dbAccountModule;

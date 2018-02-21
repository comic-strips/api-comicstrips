function dbUserModule($imports) {
	const {app, auth, db, utils} = $imports;
	const eventEmitter = utils.eventEmitter;
	const subTree = process.env.NODE_ENV;
	const snapshotToArray = utils.snapshotToArray;

	eventEmitter.on("db/user:createUser", onCreateUser);
	eventEmitter.on("db/user:editUser", onEditUser)

	function onCreateUser(eventData) {
		const metaDataRef = db.ref(`${subTree}/meta/${eventData.payload.meta.entityNamePlural}/${uid}`);

		return auth.updateUser(eventData.payload.user.id, 
			eventData.payload.user)
		.then(userRecord=> userRecord.toJSON().uid)
		.then(uid=> metaDataRef
			.update({entity: eventData.payload.meta.entity}))
		.catch(onError);
	};

	function onEditUser(eventData) {
		return auth.updateUser(eventData.payload.user.id, 
			eventData.payload.user)
		.then((userRecord)=> userRecord.toJSON().uid)
	};

	function onError(error) {
		console.error(error);
		return {
			code: "db/user:error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	};
};

module.exports = dbUserModule;

function databaseWrapper($imports) {
	const dbAccountModule = require("./account")($imports);
	const dbBookingModule = require("./booking")($imports);
	const dbTalentModule = require("./talent")($imports);

}

module.exports = databaseWrapper;

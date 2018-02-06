function databaseWrapper($imports) {
	const dbAccountModule = require("./account")($imports);
	const dbBookingModule = require("./booking")($imports);

}

module.exports = databaseWrapper;

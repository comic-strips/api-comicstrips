function databaseWrapper($imports) {
        const dbAccountModule = require("./account")($imports);
        const dbBookingModule = require("./booking")($imports);
        const dbTalentModule = require("./talent")($imports);
        const dbVendorModule = require("./vendor")($imports);
        const dbMailer = require("./mailer")($imports);
}

module.exports = databaseWrapper;

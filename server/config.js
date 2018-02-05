/* Basic Configuration middleware for Express application. */

const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const logger = require("morgan");
const errorhandler = require("errorhandler");

function setLogAndExceptionConfig(app) {
/*Logging and exception handling*/

        if (app.get("env")) {
                app.use(bodyParser.urlencoded({extended: true}));
                app.use(bodyParser.json());
                app.use(methodOverride());
        };

        if (app.get("env") === "development") {
                app.use(logger("dev"));
                app.use(errorhandler({dumpExceptions: true, showStack: true}));
        }; 

        if (app.get("env") === "production") {
                app.use(errorhandler({dumpExceptions: true, showStack: true}));
        };
};

module.exports = {setLogAndExceptionConfig}

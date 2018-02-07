const http = require("http");
const dotenv = require("dotenv").config();
const express = require("express");
const serviceAccountKey = require("../service-account-key.json")
const app = express();
const server = http.createServer(app);
const baseConfig = require("./config");
const admin = require("firebase-admin");
const mainAPI = require("../api");
/*const localtunnel = require("localtunnel")(8080, {subdomain: "apicomicstrips"}, function(err, tunnel) { 
		err? console.log(error): console.log(`Twilio webhook set on ${tunnel.url}`);
});*/

baseConfig.setLogAndExceptionConfig(app);
admin.initializeApp({
	credential: admin.credential.cert(serviceAccountKey || process.env.serviceAccountKey),
	databaseURL: process.env.DATABASE_URL
});

const db = admin.database();
const auth = admin.auth();
const $exports = {db, auth, app};

app.get("/api/v1/test", (request, response)=> {
	response.json({"msg": "System operating within normal parameters."});
});

app.get("/api/v1/dbtest", (request, response)=> {
	db.ref("test").once("value")
	.then((snapshot)=> snapshot.val())
	.then(data => response.json(data))
	.catch(onError);
})

mainAPI($exports).start();

function onError(error) {
	console.error(error);
	return error;
}

server.listen(process.env.PORT || 8080);
console.log("Express server listening on port %d in %s mode",
server.address().port, app.settings.env)

const http = require("http");
const express = require("express");
const events = require("events");
const app = express();
const server = http.createServer(app);
const baseConfig = require("./server/config");

baseConfig.setLogAndExceptionConfig(app);

app.get("/api/v1/test", (request, response) => {
	response.json({"msg": "System operating within normal parameters."});
});

server.listen(process.env.PORT || 8080);

console.log("Express server listening on port %d in %s mode",
server.address().port, app.settings.env)
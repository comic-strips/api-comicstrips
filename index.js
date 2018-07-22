(function() {
  const Sandbox = require("./src/classes/Sandbox.js");
  new Sandbox(["*"], (instance)=> instance.httpServer.start());
}());
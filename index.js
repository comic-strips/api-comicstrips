(function() {
  const Sandbox = require("./src/classes/Sandbox.js");

  (function validateEnvironment() {
    if (process.env.NODE_ENV === "production") {
      return;
    } else {
      const dotenv = require("dotenv").config();
    }
  }());


  new Sandbox(["*"], (instance)=> instance.httpServer.start());
}());
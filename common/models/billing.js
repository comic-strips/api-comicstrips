"use strict";

module.exports = function(Billing) {
  /* import directly from utils module; app is not ready yet. */
  const {Events} = require("../../server/utils");
  const eventEmitter = Events.eventEmitter;

  eventEmitter.on("server:App-Start", (app)=> {
    /* complete list of application models unavailable until App-Start */
   
  /*===server:App-Start===*/  
  });
};
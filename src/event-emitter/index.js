function eventEmitter(instance) {
  const events = require("events");
  instance.eventEmitter = new events.EventEmitter();
}

module.exports = eventEmitter;
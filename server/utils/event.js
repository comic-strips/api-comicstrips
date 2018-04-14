const events = require("events");
const selfAddressed = require("self-addressed");
const eventEmitter = new events.EventEmitter();
//const _emit = events.EventEmitter.prototype.emit;
const env = process.env.NODE_ENV;

/*eventEmitter.emit = function(name, data) {
  if (env === "development") {
    console.log(`Event emitted: ${name} @ ${new Date().toLocaleTimeString("en-us", {"timeZone": "America/New_York"})}`);
  }
  function mailman(address, envelope) {
    _emit.call(address, name, envelope);
  }
  return selfAddressed(mailman, this, data); // returns a promise
};

const _on = events.EventEmitter.prototype.on;

eventEmitter.on = function (name, fn) {
  function onSelfAddressedEnvelope(envelope) {
    if (selfAddressed.is(envelope)) {
      const result = fn(envelope.payload);
      selfAddressed(envelope, result);
      // there is nowhere to send the response envelope
      // event emitters are unidirectional.
      // so open the envelope right away!
      envelope.replies = 1;
      selfAddressed(envelope); // deliver
    }
  }
  _on.call(this, name, onSelfAddressedEnvelope);
};*/

function $Event(data, meta) {
  const date = new Date();
  const eventDate = date.getTime();
  const eventDateTime = date.toLocaleDateString("en-us") + " " +
   date.toLocaleTimeString("en-us", {
    "timeZone": "America/New_York",
   });

  function generateUUID() {
    let d = new Date().getTime();
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      let r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=="x" ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  }; 
 
  return {
    header: {
      id: generateUUID(),
      origin: meta.origin,
      type: meta.type,
      unixTime: eventDate,
      timestamp: eventDateTime,
      description: meta.desc || "No event description."
    },
    payload: data,
  }
};

module.exports = {eventEmitter, $Event};

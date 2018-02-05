
//===* EventEmitter implementation with Promises *===/
//https://glebbahmutov.com/blog/promisify-event-emitter/

const events = require("events");
const selfAddressed = require("self-addressed");
const eventEmitter = new events.EventEmitter();
const _emit = events.EventEmitter.prototype.emit;

eventEmitter.emit = function(name, data) {
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
};

function snapshotToArray(snapshot) {
	const $$snapshot = snapshot.val();
	const resArray = [];
	
	for (let key in $$snapshot) {
		$$snapshot[key]["id"] = key;
		resArray.push($$snapshot[key])
	}

	return resArray.reverse();
}

function onSubtreeIdListUpdate(ref, id, snapshot) {
	const currentSnapshot = snapshot.val();
	if (!currentSnapshot) {
		ref.set([id]);
	} else {
		const idList = new Set([].concat(currentSnapshot));
		idList.add(id);
		ref.set(Array.from(idList));
	}
	return id;
}

module.exports = {eventEmitter, snapshotToArray, onSubtreeIdListUpdate};


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
};


function onSubtreeIdListRemove(ref, id, snapshot) {
/* TODO: MAKE DRY. REFACTOR SUCH THAT ONSUBTREELISTUPDATE CAN ADD OR DELTE FROM A LIST */
	const currentSnapshot = snapshot.val();
	const idList = new Set([].concat(currentSnapshot));
	idList.delete(id);
	ref.set(Array.from(idList));
	return id;
};

function onSubtreeIdListUpdate(ref, id, snapshot) {
/* TODO: MAKE DRY. REFACTOR SUCH THAT ONSUBTREELISTUPDATE CAN ADD OR DELTE FROM A LIST */
	const currentSnapshot = snapshot.val();
	if (!currentSnapshot) {
		ref.set([id]);
	} else {
		const idList = new Set([].concat(currentSnapshot));
		idList.add(id);
		ref.set(Array.from(idList));
	}
	return id;
};

function EventFactory({ type, source }) {
	return function $Event() {
		const [annotation, data] = arguments;
		const date = new Date();
		const eventDate = date.getTime();
		const eventDateTime = date.toLocaleDateString("en-us") + " " +
		 date.toLocaleTimeString("en-us", {
		 	"timeZone": "America/New_York",
		 });
		function getStackTrace() {
			let stack;

			try {
				throw new Error("");
			} catch (error) {
				stack = error.stack || "";
			}

			stack = stack.split("\n").map(function(line) {
				return line.trim();
			});
			return stack.splice(stack[0] == "Error" ? 2 : 1);
		}

		return {
			header: {
				id: generateUUID(),
				source: source || type,
				type: type,
				unixTime: eventDate,
				timestamp: eventDateTime,
				annotation:
				typeof annotation === "string" ? annotation : "No event annotation."
			},
			payload: arguments.length < 2 ? arguments[0] : data,
			trace: getStackTrace
		};
	};
};

function generateUUID() {
	let d = new Date().getTime();
	let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
	let r = (d + Math.random()*16)%16 | 0;
	d = Math.floor(d/16);
	return (c=="x" ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
};


function flatten(array) {
	return Array.isArray(array) ? [].concat.apply([], array.map(flatten)) : array;
};

module.exports = {
	eventEmitter, 
	snapshotToArray, 
	onSubtreeIdListUpdate,
	onSubtreeIdListRemove, 
	EventFactory,
	flatten
};

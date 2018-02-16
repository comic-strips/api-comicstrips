
function backendModule($imports) {
	const config = require("./api.json");
	const utils = require("./utils")
	const {modules} = config;

	function loadModule(module) {
		require(`./${module}`)(Object.assign($imports, {utils}));
	}

	function start() {
		modules.forEach(loadModule);
	}

	return {start}
}

module.exports = backendModule;
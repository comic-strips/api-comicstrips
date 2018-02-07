function dispatchModule($imports) {
	const {mode} = $imports;
	const apiKey = process.env.MAILGUN_API_KEY;
	const domain = process.env.MAILGUN_DOMAIN;
	const mailgun = require("mailgun-js")({apiKey, domain});

	(function validateMode(mode) {
		if (mode === "development") {
			console.warn("Dispatch moodule intialized with dev user. Outbound emails directed to ethereal inbox.");
		}
	}(mode))
	/*const data = {
		from: "sean.travis.taylor@icloud.com",
		to: "sean.travis.taylor@gmail.com",
		subject: "Hello",
		text: "Testing some Mailgun awesomness!"
	};*/

	/*mailgun.messages().send(data, function (error, body) {
		console.log(body);
	});*/

	function sendBatchEmail(data) {
		console.log("sendBatchEmail", data);
	}

	return {sendBatchEmail}
}

module.exports = dispatchModule;
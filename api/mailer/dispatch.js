function dispatchModule($imports) {
        const apiKey = process.env.MAILGUN_API_KEY;
        const domain = process.env.MAILGUN_DOMAIN;
        const mailgun = require("mailgun-js")({ apiKey, domain });

        (function validateMode(mode) {
                if (mode === "development") {
                        console.warn(
                                "ATTN: Dispatch moodule intialized with dev user. Outbound emails directed to Ethereal inbox."
                        );
                }
        })();

        function onSend(error, body) {
                if (error) {
                        onError(error);
                        return;
                }
                //console.log(body);
        }

        function sendEmail(messageConfig, addresseeList) {
                addresseeList.forEach((addressee)=> {
                        mailgun.messages().send(Object.assign(messageConfig, {
                                to: process.env.MAILER_TEST_USER
                        }),onSend);
                });
        }

        function onError(error) {
                console.error(error);
                return {
                        code: "distpatch:error",
                        msg: error.message,
                        stack: error.stack.split("\n")
                };
        }

        return { sendEmail };
}

module.exports = dispatchModule;

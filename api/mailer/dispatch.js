function dispatchModule($imports) {
        const templateModule = $imports.templateModule();
        const config = require("./mailer.json");
        const templateMap = config.templates;
        const apiKey = process.env.MAILGUN_API_KEY;
        const domain = process.env.MAILGUN_DOMAIN;
        const mailgun = require("mailgun-js")({ apiKey, domain });

        (function validateMode(mode) {
                if (mode === "development") {
                        console.warn(
                                "ATTN: Dispatch moodule intialized with dev user. Outbound emails directed to Ethereal inbox."
                        );
                }
        })(process.env.NODE_ENV);

        function onSend(error, body) {
                if (error) {
                        onError(error);
                        return;
                }
                //console.log(body);
        }

        function sendEmail(type, data, addresseeList) {
                addresseeList.forEach((addressee)=> {
                        mailgun.messages().send({
                                subject: templateMap[type][addressee.entity].subject,
                                from: templateMap[type][addressee.entity].sender,
                                to: process.env.MAILER_TEST_USER,
                                html: templateModule.getTemplate({
                                        entity: addressee.entity,
                                        type, 
                                        data
                                })
                        }, onSend);
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

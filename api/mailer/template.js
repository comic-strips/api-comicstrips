function templateModule($imports) {
        /*const data = {
		from: "sean.travis.taylor@icloud.com",
		to: "sean.travis.taylor@gmail.com",
		subject: "Hello",
		text: "Testing some Mailgun awesomness!"
	};*/


        function getTemplate(templateName = defaultTemplate) {
                return (
                        templateMap[templateName] ||
                        templateMap["defaultTemplate"]
                );
        }

        function configMessage({ addressee, bookingId }) {
                return {
                        from: "noreply@comicstrips.nyc",
                        to: process.env.MAILER_TEST_USER,
                        subject: `ShirtlessGram Confirmation: Booking No. ${bookingId}`,
                        html: getTemplate(addressee.entity)
                };
        }

        return { getTemplate, configMessage };
}

module.exports = templateModule;

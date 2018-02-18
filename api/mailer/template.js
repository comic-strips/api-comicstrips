function emailTemplateModule($imports) {
	const ejs = require("ejs");
        const templates = require("./mailer.json").templates;

        function getTemplate({entity, type, data}) {
        	return ejs.render(
        		require(`${templates[type][entity].template}`).body, {booking: data
        		});
        };

        return { getTemplate };
}

module.exports = emailTemplateModule;

function emailTemplateModule($imports) {
	const ejs = require("ejs");
        const templates = require("./mailer.json").templates;

        function getTemplate({entity, type, data}) {
        	return ejs.renderFile(`${__dirname}${templates[type][entity].template}`, {
        			data: data
        		}, onRender);
        };

        function onRender(err, str) {
        	return err ? onError(err) : str;
        };

        function onError(error) {
		console.error(error);
		return {
			code: "mailer/template:error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	};

        return { getTemplate };
};

module.exports = emailTemplateModule;

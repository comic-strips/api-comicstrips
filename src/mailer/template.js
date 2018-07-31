function emailTemplateModule($imports) {
  const ejs = require("ejs");
  const templates = require("./mailer.json").templates;

  function getHTMLTemplate({entity, type, data}) {
  	const promise = new Promise((resolve, reject)=> {
      ejs.renderFile(`${__dirname}${templates[type][entity].template}`, {
        data
      }, onRender.bind(null, resolve));
    });

    return promise;
  };

  function onRender(resolve, err, str) {
  	return err ? onError(err) : resolve(str);
  };

  function onError(error) {
		console.error(error);
		return {
			code: "mailer/template:error", 
			msg: error.message, 
			stack: error.stack.split("\n")
		};
	};

  return {getHTMLTemplate};
};

module.exports = emailTemplateModule;

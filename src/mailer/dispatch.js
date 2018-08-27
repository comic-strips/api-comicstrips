function dispatchModule($imports) {
  const templateModule = $imports.templateModule();
  const config = require("./mailer.json");
  const templateMap = config.templates;
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const mailgun = require("mailgun-js")({apiKey, domain});

  function onSend(error, body) {
    if (error) {
      onError(error);
      return;
    }
  };

  function sendEmail(type, data, addresseeList) {
    addresseeList.forEach((addressee)=> {
      mailgun.messages().send({
        subject: templateMap[type][addressee.meta.entity].subject,
        from: templateMap[type][addressee.meta.entity].sender,
        to: addressee.email,
        html: templateModule.getTemplate({
          entity: addressee.meta.entity,
          data: [data, addressee],
          type
        })
      }, onSend);
    });
  };

  function onError(error) {
    console.error(error);
    return {
      code: "distpatch:error",
      msg: error.message,
      stack: error.stack.split("\n")
    };
  };

  return { sendEmail };
};

module.exports = dispatchModule;

function smsTemplateModule($imports) {
  const ejs = require("ejs");
  const config = require("./sms.json");
  const templateMap = config.templates;
  const twilio = require("twilio");
  const accountSID = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_NUMBER;
  const client = new twilio(accountSID, authToken);

  function sendMessage(msgType, booking, contact) {
    buildSMSMessage(templateMap[msgType][contact.meta.entity].template, {
      booking,
      contact
    })
    .then((messageBody)=> {
      console.log("Sending outbound talent request...", {messageBody});

      /*client.messages.create(Object.assign({}, {
        body: messageBody,
        to: contact.phoneNumber,
        from: twilioNumber
      })).catch(onError); */  
    });
  };

  function buildSMSMessage(template, data) {
    const promise = new Promise((resolve, reject)=> {
      return ejs.renderFile(`${__dirname}${template}`, {data}, onRender.bind(null, resolve));
    });

    return promise;
  };

  function onRender(resolve, err, str) {
    return err ? onError(err) : resolve(str);
  };

  function onError(error) {
    console.error(error);
    return {
      code: "sms:error",
      msg: error.message,
      stack: error.stack.split("\n")
    };
  };

  return {sendMessage}
}



module.exports = smsTemplateModule;
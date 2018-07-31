function smsTemplateModule($imports) {
  const ejs = require("ejs");
  const config = require("./sms.json");
  const templateMap = config.templates;
  /*const twilio = require("twilio");
  const accountSID = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_NUMBER;
  const client = new twilio(accountSID, authToken);*/

  function sendMessage(msgType, booking, contact) {
    /*client.messages.create(Object.assign({}, {
      body: buildSMSMessage(templateMap[msgType][contact.meta.entity].template, {
        booking,
        contact
      }),
      to: contact.phoneNumber,
      from: twilioNumber
    })).catch(onError);*/
  };

  function buildSMSMessage(template, data) {
    return ejs.renderFile(`${__dirname}${template}`, {data}, onRender);
  };

  function onRender(err, str) {
    return err ? onError(err) : console.log(str);
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
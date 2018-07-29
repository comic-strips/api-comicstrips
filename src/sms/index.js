function smsService(instance) {
  /*const twilio = require("twilio");
  const config = require("./sms.json");
  const templateMap = config.templates;
  const accountSID = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_NUMBER;
  const client = new twilio(accountSID, authToken);*/

  function send() {

  }
  

  instance.sms = {send};
}

module.exports = smsService;
function smsModule(app) {
  const twilio = require("twilio");
  const ejs = require("ejs");
  const {Utils} = app;
  const {Events, Meta} = Utils;
  const $Event = Events.$Event;
  const eventEmitter = Events.eventEmitter;
  const config = require("./sms.json");
  const templateMap = config.templates;
  const accountSID = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_NUMBER;
  const client = new twilio(accountSID, authToken);
  const {talent} = app.models;

  eventEmitter.on("bookingCreated", (booking)=> {
    talent.find().then((talentList)=> {
      /*TODO: Filter talentList by talent availability. 
      * .then((filteredTalent))
      */
      talentList.forEach(onContact.bind(null, "bookingCreated", booking));
    });
  });
  
  function buildSMSMessage(template, data) {
    return ejs.renderFile(`${__dirname}${template}`, {data}, onRender);
  };

  function onContact(msgType, booking, contact) {
    client.messages.create(Object.assign({}, {
      body: buildSMSMessage(templateMap[msgType][contact.meta.entity].template, {
        booking,
        contact
      }),
      to: contact.phoneNumber,
      from: twilioNumber
    })).catch(onError);
  };


  function onRender(err, str) {
    return err ? onError(err) : str;
  };

  function onError(error) {
    console.error(error);
    return {
      code: "sms:error",
      msg: error.message,
      stack: error.stack.split("\n")
    };
  };
};

module.exports = smsModule;
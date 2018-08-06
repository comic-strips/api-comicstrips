function smsService(instance) {
  const {db, eventEmitter} = instance;
  const ejs = require("ejs");
  const templateModule = require("./template.js")();
 
  eventEmitter.on("outbound_talent_request", onTalentRequest);

  function onTalentRequest({talentList, booking}) {
    talentList.forEach(templateModule.sendMessage.bind(null, "bookingCreated", booking))
  }

  function send() {

  }
  

  instance.sms = {send};
}

module.exports = smsService;
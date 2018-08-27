function smsService(instance) {
  const {db, eventEmitter} = instance;
  const ejs = require("ejs");
  const templateModule = require("./template.js")();
 
  eventEmitter.on("outbound-talent-request", onTalentRequest);

  function onTalentRequest({talentList, booking}) {
    talentList.forEach(templateModule.sendMessage.bind(null, "booking-created", booking))
  }

  function send() {
    console.log("CLI: sending outbound-talent-request...");
  }
  

  instance.sms = {send};
}

module.exports = smsService;
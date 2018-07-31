function mailService(instance) {
  const {db, eventEmitter} = instance;
  const config = require("./mailer.json");
  const templateModule = require("./template.js")();
  const templateMap = config.templates;
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: config.mailProvider,
    secure: true,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASSWORD
    }
  });

  eventEmitter.on("inbound_bookreq_acknowledged", onBookRequest);

  function sendMessage(type, data, addresseeList) {
    addresseeList.forEach((addressee)=> {
      const messageMetadata = {
        from: templateMap[type][addressee.meta.entity].sender,
        to: addressee.email,
        subject: templateMap[type][addressee.meta.entity].subject
      };

      templateModule.getHTMLTemplate({
        entity: addressee.meta.entity,
        data: [data, addressee],
        type
      })
      .then(onHTML.bind(null, messageMetadata))
      .then((message)=> {
         console.info("Sending email...");
        //transporter.sendMail(message, onSend)
      })
    });
  }

  function onBookRequest(booking) {
    db.collection("customers").findById(booking.customer_id)
    .then((customer)=> {
      sendMessage("inbound_bookreq_acknowledged", booking, customer);
    });
  }

  function onHTML(messageMetadata, html) {
    return Object.assign(messageMetadata, {html});
  }

  function onError(error) {
    console.error(error);
    return {
      code: "distpatch:error",
      msg: error.message,
      stack: error.stack.split("\n")
    };
  };

  function onSend(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  }
}

module.exports = mailService;
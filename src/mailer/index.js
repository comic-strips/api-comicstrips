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

  eventEmitter.on("inbound-bookreq-acknowledged", onBookRequest);
  eventEmitter.on("booking-confirmed", onBookingConfirmed);
  eventEmitter.on("outbound-booking-confirmation", onOutboundBookingConfo);
  eventEmitter.on("found-payment-error", onPaymentError);

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
        console.info(`Sending ${type} email to: ${addressee.email}`);
        //console.log({message});
        //transporter.sendMail(message, onSend);
      })
    });
  }

  function onBookingConfirmed(data) {
    console.log("Booking confirmed...");
    const {vendorList, booking, skuList} = data;
    vendorList.forEach((vendor)=> {
      sendMessage("vendor-order-created", {skuList, booking, vendor}, [vendor]);
    });
  }

  function onOutboundBookingConfo(data) {
    console.log("Sending outbound booking confirmation...");
    const {talent, booking} = data;

    db.collection("customers").findById(booking.customer_id)
    .then(([customer])=> {
      sendMessage("booking-confirmed", {booking}, [customer, talent]);
    }).catch(onError);
  }

  function onBookRequest(booking) {
    db.collection("customers").findById(booking.customer_id)
    .then((customer)=> {
      sendMessage("inbound-bookreq-acknowledged", booking, customer);
    })
    .catch(onError);
  }

  function onPaymentError(bookingData) {
    const {booking, ...errorData} = bookingData;

    db.collection("customers").findById(booking.customer_id)
    .then(([customer])=> {
      try {
      sendMessage("payment-error", {booking}, [customer]);
    } catch(e) {
      console.log(e);
    }
    }).catch(onError);
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
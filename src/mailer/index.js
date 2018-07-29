function mailService(instance) {
  const {eventEmitter} = instance;
  
  eventEmitter.on("inbound_bookreq_acknowledged", onBookRequest);

  function onBookRequest({booking, acctMgr}) {
    console.log({booking, acctMgr})
  }

}

module.exports = mailService;
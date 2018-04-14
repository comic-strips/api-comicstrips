function accountManagerModule(app) {
  const {Utils} = app;
  const {Events, Meta} = Utils;
  const $Event = Events.$Event;
  const eventEmitter = Events.eventEmitter;

  function onAccountManagers(accountMgrList) {
    const availableAccountManagers = accountMgrList.map((acctMgr)=> {
      /*This filter works for some reason... Where as the where filter in the Bookings.js module doesn't. Hmm...*/
      return acctMgr.bookings({where: {accountManager_id: acctMgr.id}})
      .then((bookingsList)=> {
        return Object.assign(acctMgr, {bookingsPending: bookingsList.length});
      });
    });

    return Promise.all(availableAccountManagers).then((list)=> {
      return list.find(acctMgr=> acctMgr.bookingsPending < 3);
    });
  };

  function assignAccountManager(context, acctMgr) {
    if (!acctMgr) {
      context.instance.accountManager_id = "NOT-ASSIGNED";
      /*access systemEvents model; post new $Event;*/
      /*
      * new $Event(context.instance, {  
        desc: "Booking has no account manager attached.",
        origin: "./account-manager/index.js",
        type: "BOOKING/ORPHANED"
      }).desc 
      */
      console.log("Booking has no account manager attached.");
    } else {
      context.instance.accountManager_id = acctMgr.id;
    }
    
    return acctMgr;
  };

  return {onAccountManagers, assignAccountManager}
};

module.exports = accountManagerModule;
function bookingPipelineModule($imports) {
  const generateRefNo = require("./ref-number.js")
  const {db, eventEmitter} = $imports;

  function onInboundBooking(bookingId) {
    db.collection("account-managers").find()
    .then(onAssignAccountManager.bind(null, bookingId))
    .then(onUpdateBookingRefNo)
    .then(onUpdateBookingAcctManager)
    .then(({booking, acctMgr})=> {
      eventEmitter.emit("inbound_bookreq_acknowledged", {booking, acctMgr});
      return booking;
    })
    .catch(onError);
  }

  function onAssignAccountManager(bookingId, accountMgrList) {
    const availableAccountManagers = accountMgrList.filter((acctMgr)=> {
      return acctMgr.bookings.length < 3;
    });
    const [firstAvailable] = availableAccountManagers;

    return db.collection("bookings").update(bookingId, {
      accountManager_id: firstAvailable.id
    });
  }

  function onUpdateBookingAcctManager(booking) {
    return db.collection("account-managers")
    .findById(booking.accountManager_id)
    .then(([acctMgr])=> {
      const currentBookings = new Set(acctMgr.bookings);
      currentBookings.add(booking.id);

      return db.collection("account-managers").update(booking.accountManager_id, {
        bookings: Array.from(currentBookings) 
      })
      .then((updatedBooking)=> { return {booking: updatedBooking, acctMgr}})
    });
  }

  function onUpdateBookingRefNo(booking) {
    return db.collection("bookings").update(booking.id, {
      "offer_id": generateRefNo() 
    }).then(updatedBooking=> updatedBooking);
  }

  function onNotifyTalent(booking) {
    return db.collection("talent").find().then((talentList)=> {
      talentList.filter(onAvailable).forEach((talent)=> {
        sms.send(talent, booking.refNo);
      });
      return booking;
    });
  }

  function onAvailable(talent) {
    //TODO: Build talent selection alogrithm
    return talent;
  } 

  function onUpdateBookingStatus() {
    
  }

  function onError(e) {
    console.error(e);
  }

  return {onInboundBooking};
}

module.exports = bookingPipelineModule;
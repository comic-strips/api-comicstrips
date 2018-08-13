function bookingPipelineModule($imports) {
  const generateRefNo = require("./ref-number.js");
  const {db, eventEmitter} = $imports;
  const statusMonitor = require("./status-monitor.js")({db});


  function onInboundBooking(bookingId) {
    db.collection("account-managers").find()
    .then(onAssignAccountManager.bind(null, bookingId))
    .then(onUpdateBookingRefNo)
    .then(onUpdateBookingAcctManager)
    .then(({booking, acctMgr})=> {
      eventEmitter.emit("inbound-bookreq-acknowledged", booking);
      statusMonitor.watch(watchBooking.bind(null, booking.id), 10000);
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
      .then((updatedBooking)=> { return {booking, acctMgr}})
    });
  }

  function onUpdateBookingRefNo(booking) {
    return db.collection("bookings").update(booking.id, {
      "offer_id": process.env.NODE_ENV === "development" ? generateRefNo(60174) : generateRefNo() 
    }).then(updatedBooking=> updatedBooking);
  }

  function watchBooking(bookingId) {
    db.collection("bookings").findById(bookingId)
    .then(([booking])=> {
      if (booking.status === "PENDING") {
        eventEmitter.emit("found-stale-booking", booking);
      }
    })
  }

  function onError(e) {
    console.error(e);
  }

  return {onInboundBooking};
}

module.exports = bookingPipelineModule;
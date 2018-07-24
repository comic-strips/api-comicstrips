function bookingPipeline($imports) {
  const {db, mailer} = $imports;

  function onProcess(bookingId) {
    db.collection("account-managers").find()
    .then(onAssignAccountManager.bind(null, bookingId))
    .then(onUpdateBookingAcctManager)
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

      db.collection("account-managers").update(booking.accountManager_id, {
        bookings: Array.from(currentBookings) 
      });
      return booking;
    });
  }

  function onNotifyTalent() {

  }

  function onSendEmailConfirmation() {
    
  }

  function onError(e) {
    console.error(e);
  }

  return {onProcess};
}


module.exports = bookingPipeline;
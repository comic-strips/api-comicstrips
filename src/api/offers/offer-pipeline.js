function offerPipelineModule($imports) {
  const {db, eventEmitter} = $imports;

  function onInboundOfferReply({offerId, talentPhone}) {
    findAvailableTalent(offerId, talentPhone)
    .then(findBookingByOfferId)
    .then(updateBookingStatus)
    .then(updateTalentBookings)
    .then((data)=> {
      eventEmitter.emit("booking-offer-accepted", data);
    });
  }

  function findAvailableTalent(offerId, talentPhone) {
    return db.collection("talent").find(tal=> tal.phoneNumber === talentPhone)
    .then(([talent])=> Object.assign({}, {talent, offerId}));
  }

  function findBookingByOfferId(replyData) {
    return db.collection("bookings").find(booking=> booking.offer_id === replyData.offerId)
    .then(([booking])=> Object.assign(replyData, {booking}));
  }

  function updateBookingStatus(data) {
    return db.collection("bookings").update(data.booking.id, {
      status: "CONFIRMED",
      talent_id: data.talent.id
    }).then((booking)=> Object.assign(data, {booking}));
  }

  function updateTalentBookings(data) {
    return db.collection("talent").update(data.talent.id, {
      bookings: Array.from(new Set(data.talent.bookings).add(data.booking.id))
    }).then((talent)=> Object.assign(data, {talent}));
  }
 
  return {onInboundOfferReply};
}

module.exports = offerPipelineModule;
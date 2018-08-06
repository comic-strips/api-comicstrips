function offerPipelineModule($imports) {
  const {db, eventEmitter} = $imports;

  function onInboundOfferReply({offerId, talentPhone}) {
    findAvailableTalent(offerId, talentPhone).then((data)=> console.log(data));
  }

  function findAvailableTalent(offerId, talentPhone) {
    return db.collection("talent").find(tal=> tal.phoneNumber === talentPhone)
    .then(([talent])=> Object.assign({}, {talent, offerId}));
  }
 
  return {onInboundOfferReply};
}

module.exports = offerPipelineModule;
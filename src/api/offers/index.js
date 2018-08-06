function offerAPI(instance) {
  const {httpServer: {app}, db, eventEmitter} = instance;
  const offerPipeline = require("./offer-pipeline")({db, eventEmitter});

  app.post("/api/v2/offers", (request, response)=> {
    const {From, Body} = request.body;
    const offerId = parseInt(Body.split(" ")[1]);

    offerPipeline.onInboundOfferReply({offerId, talentPhone: From});
    response.json({});
  });

  function onError(e) {
    console.error(e);
  }
}

module.exports = offerAPI;
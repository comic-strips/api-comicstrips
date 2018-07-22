function talentAPI(instance) {
  const {httpServer: {app}, db} = instance;

  app.get("/api/v2/talent", (request, response)=> {
    db.collection("talent").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });
}

module.exports = talentAPI;
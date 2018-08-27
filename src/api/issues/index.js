function issuesAPI(instance) {
  const {httpServer: {app}, db} = instance;

  app.get("/api/v2/issues", (request, response)=> {
    db.collection("issues").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });

  function onError(e) {
    console.error(e);
  }
}

module.exports = issuesAPI;
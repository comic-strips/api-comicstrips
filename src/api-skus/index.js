function skusAPI(instance) {
  const {httpServer: {app}, db} = instance;

  app.get("/api/v2/skus", (request, response)=> {
    db.collection("skus").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });
}

module.exports = skusAPI;
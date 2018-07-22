function vendorsAPI(instance) {
  const {httpServer: {app}, db} = instance;

  app.get("/api/v2/vendors", (request, response)=> {
    db.collection("vendors").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });
}

module.exports = vendorsAPI;
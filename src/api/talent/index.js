function talentAPI(instance) {
  const {httpServer: {app}, db, eventEmitter} = instance;
  const talentPipeline = require("./talent-pipeline")({db, eventEmitter}); 

  app.get("/api/v2/talent", (request, response)=> {
    db.collection("talent").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });

  app.get("/api/v2/talent/:id", (request, response)=> {
    const id = request.params.id;
     db.collection("talent").findById(id).then((data)=> {
      response.json({entries: data.length, data});
    }).catch(onError);
  });

  app.post("/api/v2/talent", (request, response)=> {
    db.collection("talent").push(request.body).then((id)=> {
      response.json({"status": "created", id});
    }).catch(onError);
  });

  app.put("/api/v2/talent/:id", (request, response)=> {
    const id = request.params.id;
    const data = request.body;
    db.collection("talent").update(id, data).then((id)=> {
      response.json({"status": "updated", id});
    }).catch(onError);
  });

  app.delete("/api/v2/talent/:id", (request, response)=> {
    db.collection("talent").remove(request.params.id).then((id)=> {
      response.json({"status": "deleted", id});
    }).catch(onError);
  });

  function onError(e) {
    console.error(e);
  }
}

module.exports = talentAPI;
function recipientsAPI(instance) {
  const {httpServer: {app}, db} = instance;

  app.get("/api/v2/recipients", (request, response)=> {
    db.collection("recipients").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });

  app.get("/api/v2/recipients/:id", (request, response)=> {
    const id = request.params.id;
     db.collection("recipients").findById(id).then((data)=> {
      response.json({entries: data.length, data});
    }).catch(onError);
  });

  app.post("/api/v2/recipients", (request, response)=> {
    db.collection("recipients").push(request.body).then((id)=> {
      response.json({"status": "created", id});
    }).catch(onError);
  });

  app.put("/api/v2/recipients/:id", (request, response)=> {
    const id = request.params.id;
    const data = request.body;
    db.collection("recipients").update(id, data).then((id)=> {
      response.json({"status": "updated", id});
    }).catch(onError);
  });

  app.delete("/api/v2/recipients/:id", (request, response)=> {
    db.collection("recipients").remove(request.params.id).then((id)=> {
      response.json({"status": "deleted", id});
    }).catch(onError);
  });

  function onError(e) {
    console.error(e);
  }
}

module.exports = recipientsAPI;
function accountsAPI(instance) {
  const {httpServer: {app}, db} = instance;

  app.get("/api/v2/account-managers", (request, response)=> {
    db.collection("account-managers").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });

  app.get("/api/v2/account-managers/:id", (request, response)=> {
    const id = request.params.id;
     db.collection("account-managers").findById(id).then((data)=> {
      response.json({entries: data.length, data});
    }).catch(onError);
  });

  app.post("/api/v2/account-managers", (request, response)=> {
    db.collection("account-managers").push(request.body).then((id)=> {
      response.json({"status": "created", id});
    }).catch(onError);
  });

  app.put("/api/v2/account-managers/:id", (request, response)=> {
    const id = request.params.id;
    const data = request.body;
    db.collection("account-managers").update(id, data).then((id)=> {
      response.json({"status": "updated", id});
    }).catch(onError);
  });

  app.delete("/api/v2/account-managers/:id", (request, response)=> {
    db.collection("account-managers").remove(request.params.id).then((id)=> {
      response.json({"status": "deleted", id});
    }).catch(onError);
  });

  function onError(e) {
    console.error(e);
  }
}

module.exports = accountsAPI;
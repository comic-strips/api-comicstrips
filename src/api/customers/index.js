function customersAPI(instance) {
  const {httpServer: {app}, db} = instance;

  app.get("/api/v2/customers", (request, response)=> {
    db.collection("customers").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });

  app.get("/api/v2/customers/:id", (request, response)=> {
    const id = request.params.id;
     db.collection("customers").findById(id).then((data)=> {
      response.json({entries: data.length, data});
    }).catch(onError);
  });

  app.post("/api/v2/customers", (request, response)=> {
    db.collection("customers").push(request.body).then((id)=> {
      response.json({"status": "created", id});
    }).catch(onError);
  });

  app.put("/api/v2/customers/:id", (request, response)=> {
    const id = request.params.id;
    const data = request.body;
    db.collection("customers").update(id, data).then((id)=> {
      response.json({"status": "updated", id});
    }).catch(onError);
  });

  app.delete("/api/v2/customers/:id", (request, response)=> {
    db.collection("customers").remove(request.params.id).then((id)=> {
      response.json({"status": "deleted", id});
    }).catch(onError);
  });

  function onError(e) {
    console.error(e);
  }
}

module.exports = customersAPI;
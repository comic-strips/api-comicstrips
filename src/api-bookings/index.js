function bookingsAPI(instance) {
  const {httpServer: {app}, db} = instance;
  const bookingPipeline = require("./booking-pipeline")({db});

  app.get("/api/v2/bookings", (request, response)=> {
    db.collection("bookings").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });

  app.get("/api/v2/bookings/:id", (request, response)=> {
    const id = request.params.id;
     db.collection("bookings").findById(id).then((data)=> {
      response.json({entries: data.length, data});
    }).catch(onError);
  });

  app.post("/api/v2/bookings", (request, response)=> {
    db.collection("bookings").push(request.body).then((id)=> {
      response.json({"status": "created", id});
      return id;
    }).then(bookingPipeline.onProcess)
    .catch(onError);
  });

  app.put("/api/v2/bookings/:id", (request, response)=> {
    const id = request.params.id;
    const data = request.body;
    db.collection("bookings").update(id, data).then((id)=> {
      response.json({"status": "updated", id});
    }).catch(onError);
  });

  app.delete("/api/v2/bookings/:id", (request, response)=> {
    db.collection("bookings").remove(request.params.id).then((id)=> {
      response.json({"status": "deleted", id});
    }).catch(onError);
  });

  function onError(e) {
    console.error(e);
  }
}

module.exports = bookingsAPI;
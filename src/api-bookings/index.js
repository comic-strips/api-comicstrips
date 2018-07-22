function bookingsAPI(instance) {
  const {httpServer: {app}, db} = instance;

  app.get("/api/v2/bookings", (request, response)=> {
    db.collection("bookings").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });
}

module.exports = bookingsAPI;
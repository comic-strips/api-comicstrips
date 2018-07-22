function ordersAPI(instance) {
  const {httpServer: {app}, db} = instance;

  app.get("/api/v2/orders", (request, response)=> {
    db.collection("orders").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });
}

module.exports = ordersAPI;
function customersAPI(instance) {
  const {httpServer: {app}, db} = instance;

  app.get("/api/v2/customers", (request, response)=> {
    db.collection("customers").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });
}

module.exports = customersAPI;
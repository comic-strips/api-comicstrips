function recipientsAPI(instance) {
  const {httpServer: {app}, db} = instance;

  app.get("/api/v2/recipients", (request, response)=> {
    db.collection("recipients").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });
}

module.exports = recipientsAPI;
function accountsAPI(instance) {
  const {httpServer: {app}, db} = instance;

  app.get("/api/v2/account-managers", (request, response)=> {
    db.collection("account-managers").find().then((data)=> {
      response.json({entries: data.length, data});
    })
  });
}

module.exports = accountsAPI;
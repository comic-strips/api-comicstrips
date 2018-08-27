function systemAPI(instance) {
  const {httpServer: {app}} = instance;

  app.get("/status", (request, response)=> {
    response.json({"message": "All systems functioning within normal parameters."});
  });
}

module.exports = systemAPI;
function dbInterface(instance) {
  const generateID  = require("../utils/generate-id.js");
  const developmentDatasource = require("./development")({generateID});
  const productionDatasource = require("./production")({generateID}); 

  function validateDatasource() {
    if (process.env.NODE_ENV === "development") {
      return developmentDatasource;
    } else {
      return productionDatasource;
    }
  }

  instance.db = validateDatasource();
}

module.exports = dbInterface;
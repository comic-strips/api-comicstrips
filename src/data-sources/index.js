function dbInterface(instance) {
  const generateID  = require("../utils/generate-id.js");
  const developmentDatasource = require("./development")({generateID});
  const productionDatasource = require("./production")({generateID}); 
  const ENV = process.argv[2];

  function validateDatasource() {
    if (ENV === "development") {
      return developmentDatasource;
    } else {
      return productionDatasource;
    }
  }

  instance.db = validateDatasource();
}

module.exports = dbInterface;
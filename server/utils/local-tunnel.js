function localTunnelModule(options) {
  const localtunnel = require("localtunnel")

  function listen() {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    localtunnel(options.port, options, (err, tunnel)=> { 
      err? console.log(error): console.log(`Twilio webhook set on ${tunnel.url}`);
    });
  };

  return {listen};
};

module.exports = localTunnelModule;
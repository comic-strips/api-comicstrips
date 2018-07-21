const $inject = require("../utils/$inject");
const moduleRegistry = require("../index.js");

class Sandbox extends $inject(moduleRegistry) {
  constructor() {
    super();
    const args = Array.from(arguments);
    const callback = args.pop();
    let modules = (args[0] && typeof args[0] === 'string') ? args : args[0]; 
    let i;  
    
    if (!(this instanceof Sandbox)) {
      return new Sandbox(modules, callback);
    }
    
    if (!modules || modules[0] === '*') {
      modules = [];
      for (i in this) {
        if (typeof(this[i]) === "function") {
          modules.push(i);
        }
      }
    }
 
    for (i = 0; i < modules.length; i += 1) {
      //call methods added to the prototype via extends.
      try {
        this[modules[i]](this);
      } catch(e) {
        console.error(e, "On MODULE:", modules[i]);
      }
    }
    callback(this);
  }
}

module.exports = Sandbox;

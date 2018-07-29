function $inject(...mixins) {
  var base = function() {};
  Object.assign(base.prototype, ...mixins);
  return base;
}


module.exports = $inject;
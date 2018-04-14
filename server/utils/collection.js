function flatten(array) {
  return Array.isArray(array) ? [].concat.apply([], array.map(flatten)) : array;
};

function updateAs(listType, initializerColl, input, fn) {
  if (fn) {
    const preprocessedInput = fn(input);
    return listType === "set" ? new Set(initializerColl).add(preprocessedInput) : initializerColl.concat(preprocessedInput);
  }
  return;
};

module.exports = {flatten, updateAs}
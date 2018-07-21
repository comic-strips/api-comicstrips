function developmentDBInterface({generateID}) {
  const developmentData = require("./data.json");
  const store = Object.assign({}, developmentData);

  function push(collectionName, data) {
    const { id = generateID() } = data;
    const entry = Object.assign({}, { id, ...data });
    if (store[collectionName]) {
      store[collectionName][id] = entry;
      return Promise.resolve(id);
    }
    store[collectionName] = {};
    store[collectionName][id] = entry;
    return Promise.resolve(id);
  }

  function remove(collectionName, id) {
    delete store[collectionName][id];
    return Promise.resolve();
  }

  function find(collectionName) {
    return Promise.resolve(Object.values(store[collectionName]));
  }

  function findById(collectionName, id) {
    return Promise.resolve([store[collectionName][id]]);
  }

  function update(collectionName, id, data) {
    store[collectionName][id] = Object.assign(store[collectionName][id], data);
    return Promise.resolve(store[collectionName][id]);
  }

  return {
    collection(collectionName) {
      return {
        push: push.bind(null, collectionName),
        remove: remove.bind(null, collectionName),
        find: find.bind(null, collectionName),
        findById: findById.bind(null, collectionName),
        update: update.bind(null, collectionName)
      };
    },
    store
  }
}

module.exports = developmentDBInterface;
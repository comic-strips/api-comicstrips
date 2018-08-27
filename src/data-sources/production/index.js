function productionDBInterface({generateID}, dbInstance) {

  function sqlWrapper(onSerializeFn) {
    const promise = new Promise((resolve, reject)=> {
      dbInstance.serialize(onSerializeFn.bind(null, resolve));
    }).catch(onError);

    return promise;
  }

  function push(collectionName, data) {
    const id = generateID();
    const values = Object.values(data);
    const placeholders = Array(values.length + 1).fill("?").join(",");

    return sqlWrapper((resolve)=> {
      const stmt = dbInstance.prepare(`INSERT INTO ${collectionName} VALUES (${placeholders})`);

      stmt.run([id, ...values], (err)=> resolve(id));
      stmt.finalize();
    });
  }

  function findById(collectionName, id) {
    return sqlWrapper((resolve)=> {
      const stmt = dbInstance.prepare(`SELECT * FROM ${collectionName} WHERE id = "${id}"`);

      stmt.get((err, row)=>  resolve([row]));
      stmt.finalize();
    });
  }

  function find(collectionName) {
    return sqlWrapper((resolve)=> {
      const stmt = dbInstance.prepare(`SELECT * FROM ${collectionName}`);
      const result = [];
      stmt.each(
          //onRow callback
          (err, row)=>  result.push(row),
          //onComplete callback
          (err, rows)=> resolve(result)
        );
        stmt.finalize();
    });
  }

  function remove(collectionName, id) {
    return sqlWrapper((resolve)=> {
     const stmt = dbInstance.prepare(`DELETE FROM ${collectionName} WHERE id = "${id}"`);

      stmt.run((err, row)=> resolve(id));
      stmt.finalize();
    });
  }

  function update(collectionName, id, data) {
    /* NOT IMPLEMENTED */
    return [];
  }

  function onError(e) {
    console.error(e);
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
    }
  }
}

module.exports = productionDBInterface
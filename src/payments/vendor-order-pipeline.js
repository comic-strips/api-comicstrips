function vendorOrderPipelineModule($imports) {
  const {db} = $imports;

  function createVendorOrder(data) {
    return buildSkuList(data)
    .then(getVendorsList)
    .catch(onError);
  }

  function buildSkuList(data) {
    const skuList = data.booking.products.map((product)=> {
      return db.collection("skus").findById(product.sku)
      .then(([sku])=> Object.assign(sku, {quantity: product.quantity}));
    });

    return Promise.all(skuList).then(list=> Object.assign(data, {skuList: list})).catch(onError)
  }

  function getVendorsList(data) {
    const vendorList = data.skuList.map((sku)=> {
      return db.collection("vendors").findById(sku.vendor_id)
      .then(([vendor])=> vendor)
    });

    return Promise.all(vendorList)
    .then(listToMap)
    .then((vList)=> Object.assign(data, {vendorList: Object.values(vList), skuList: data.skuList}))
    .catch(onError);
  };

  function listToMap(vList) {
    return vList.reduce((vMap, current)=> {
      vMap[current.id] = current;
      return vMap;
    }, {});
  }

  function onError(error) {
    throw error;
  }

  return {createVendorOrder}
}


module.exports = vendorOrderPipelineModule;
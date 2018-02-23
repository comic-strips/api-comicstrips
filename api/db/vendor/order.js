function orderModule($imports) {
	const {db, utils} = $imports;
	const subTree = process.env.NODE_ENV;
	const {eventEmitter, flatten} = utils;
        
        function createFulfillmentRequest(eventData) {
        	const vendorSKUList = eventData.payload.products
        	.map(getVendorIds.bind(null, eventData.payload));

        	return Promise.all(vendorSKUList)
        	.then((data)=> data)
        	.then(prepareVendorOrders)
        	.then((data)=> {
        		const orders = Object.keys(data).map((key)=> {
        			return eventEmitter.emit("payments:createOrder", data[key]);
        		});

        		Promise.all(orders).then(data=> console.log(data));
        	});
        };

        function getVendorIds(booking, product) {
		return db.ref(`${subTree}/skus/${product.sku}`)
		.once("value")
		.then(snapshot=> snapshot.val())
		.then(vendorId=> vendorId)
		.then((sku)=> {
			return db.ref(`${subTree}/meta/vendors/${sku.vendor}/entity`)
			.once("value")
			.then((snapshot)=> snapshot.val())
			.then((entity)=> {
				return Object.assign(sku, {
					entity, 
					parent: product.sku,
					type: "sku"
				})
			});
		})
		.then((productData)=> {
			return db.ref(`${subTree}/bookings/${booking.id}/products`).once("value")
			.then(snapshot=> snapshot.val())
			.then((productList)=> {
				const product = productList.find((item)=> {
					return item.sku === productData.parent;
				});
				return Object.assign(productData, product);
			});
		});
        };

        function onVendorSKUList(orderData) {
        	return eventEmitter.emit("payments:createOrder", orderData);
        };

        function createProductContainer(productList) {
		return productList.reduce((container, product)=> {
			container[product.vendor] = [];
			return container;
		}, {});
	};

        function prepareVendorOrders(productList) {
        	const container = createProductContainer(productList);
	        productList.forEach((item)=> {
	  		let {entity, vendor, attributes, sku, ...stripeItemDetails} = item;
	 		container[item.vendor].push(stripeItemDetails);
		});
		return container;
        };

        function createOrderItems(orderData) {
        	const items = orderData.map((order)=> {
			return Object.keys(order.skuList)
			.map((sku) => {
				return {
					type: "sku", 
					parent: sku, 
					quantity: order.skuList[sku]
				};
			});
		});

		return Object.assign(orderData, {items: utils.flatten(items)});
        };

        return {createFulfillmentRequest}
};

module.exports = orderModule;

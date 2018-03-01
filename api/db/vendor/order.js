function dbOrderModule($imports) {
	const {db, auth, utils, config} = $imports;
	const subTree = process.env.NODE_ENV;
	const {eventEmitter, flatten} = utils;
        
        function createFulfillmentRequest(eventData) {
        	const vendorSKUList = eventData.payload.products
        	.map(getVendorIds.bind(null, eventData.payload));

        	return Promise.all(vendorSKUList)
        	.then((data)=> data)
        	.then(prepareVendorOrders)
        	.then((data)=> {
        		//console.log("preparedOrderData:", data);
        		const orders = Object.keys(data).map((key)=> {
        			return eventEmitter.emit("payments:createOrder", data[key]);
        		});

        		Promise.all(orders).then(onOrderSubmit.bind(null, data));
        	});
        };

        function onOrderSubmit(skuRef, apiResponseData) {
        	apiResponseData.forEach((order)=> {
        		order.items.forEach((item, idx)=> {
        			let sku = skuRef[order.metadata.vendor].find((sku)=> item.parent === sku.parent);
        			if (sku) {
        				item.attributes = sku.attributes;
        			}
        		});
        	});

        	const orders = apiResponseData.map((order)=> {
        		order.items = order.items.filter((item)=> {
        			return item.amount !== 0;
        		});
        		return order;
        	});

        	eventEmitter.emit("jobqueue:enqueue", [{
			task: function(done) {
				eventEmitter.emit("mailer:vendorOrderCreated", orders);
				done();
			},
			shouldStart: function() {
				return new Date().getTime() >= this.startAt.getTime();
			},
			startAt: utils.createTimeStamp(config.vendors.pushVendorOrderConfirmationsAt)
		}]);
        };

        function getVendorIds(booking, product) {
		return db.ref(`${subTree}/skus/${product.sku}`)
		.once("value")
		.then(snapshot=> snapshot.val())
		.then((sku)=> {
			return db.ref(`${subTree}/meta/vendors/${sku.vendor}/entity`)
			.once("value")
			.then((snapshot)=> snapshot.val())
			.then((entity)=> {
				return Object.assign(sku, {
					entity, 
					parent: product.sku,
					type: "sku",
					vendor: sku.vendor
				});
			});
		})
		.then((productData)=> {
			return db.ref(`${subTree}/vendors/${productData.vendor}`).once("value")
			.then(snapshot=> snapshot.val())
			.then((vendorData)=> {
				return Object.assign(productData, {businessName: vendorData.businessName});
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
		})
		.then((productData)=> {
			return auth.getUser(productData.vendor)
			.then((userRecord)=> userRecord.toJSON())
			.then((userRecord)=> userRecord.email)
			.then((email) => Object.assign(productData, {email}));
		});
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
	        	let {sku, ...stripeItemDetails} = item;
	 		container[item.vendor].push(item);
		});
		return container;
        };

        return {createFulfillmentRequest}
};

module.exports = dbOrderModule;

function orderModule($imports) {
	const {db, utils} = $imports;
	const subTree = process.env.NODE_ENV;
	const {eventEmitter} = utils;
        
        function createFulfillmentRequest(eventData) {
        	const vendorSKUList = eventData.payload.vendors
        	.map(getVendorSKUs.bind(null, eventData.payload.id));

        	return Promise.all(vendorSKUList)
        	.then(onVendorSKUList);
        };

        function getVendorSKUs(bookingId, vendorId) {
		return db.ref(`${subTree}/vendors/${vendorId}/bookings/${bookingId}`)
		.once("value")
		.then(snapshot=> snapshot.val())
		.then((skuList)=> { 
			return {skuList, vendorId, bookingId}
		})
		.then((orderData)=> {
			return db.ref(`${subTree}/meta/vendors/${vendorId}`)
			.once("value")
			.then((snapshot)=> snapshot.val())
			.then((entityData)=> {
				return Object.assign(orderData, entityData);
			});
		});
        };

        function onVendorSKUList(orderData) {
        	return eventEmitter.emit("payments:createOrder", orderData);
        };

        return {createFulfillmentRequest}
};

module.exports = orderModule;

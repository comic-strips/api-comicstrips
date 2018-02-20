function dbVendorModule($imports) {
	const {utils, db} = $imports;
	const {eventEmitter, snapshotToArray, onSubtreeIdListUpdate} = utils;
	const subTree = process.env.NODE_ENV;

	eventEmitter.on("db/vendor:finalizeVendors", vendorConfirmationPipeline);

	function vendorConfirmationPipeline(eventData) {
		appendProdSkusToBookings(eventData.payload);
		return eventData.payload;
	};

	function checkVendorProducts(booking, sku, vendor) {
		if(vendor.products.includes(sku)) {
			const vendorBookingsRef = db.ref(`${subTree}/vendors/${vendor.id}/bookings/${booking.id}`);
			return vendorBookingsRef.once("value")
			.then(onSubtreeIdListUpdate.bind(
				null, 
				vendorBookingsRef, 
				sku
			));
		}
		return Promise.resolve()
	}

	function appendProdSkusToBookings(booking) {
		return db.ref(`${subTree}/vendors`).once("value")
		.then((snapshot)=> {
			const vendorList = snapshotToArray(snapshot);
			booking.products.map((sku)=> {
				return Promise.all(vendorList.map(checkVendorProducts.bind(
					null, 
					booking,
					sku
				))).catch((e)=> console.error(e))
			});
		});
	};
};

module.exports = dbVendorModule;

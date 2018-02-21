function vendorModule($imports) {
        const { app, utils } = $imports;
        const eventEmitter = utils.eventEmitter;
        
        eventEmitter.on("notifyVendors", onNotifyVendors);

        function onNotifyVendors() {
            
        }
        
        function onError(error) {
            console.error(error);
            return {
                code: "vendor:error",
                msg: error.message,
                stack: error.stack.split("\n")
            };
        };
};

module.exports = jobQueueModule;

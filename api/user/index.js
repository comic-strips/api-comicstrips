function userModule($imports) {
        const { app, utils } = $imports;
        const ee = utils.eventEmitter;
        const $Event = new utils.EventFactory({
        	type: "user-event", 
        	source: "userModule"
        });
        const subTree = process.env.NODE_ENV;

        app.post("/api/v1/users/create", (request, response)=> {
                ee.emit("db/user:createUser", new $Event(request.body)
                .then((userRecord)=> userRecord.toJSON().uid))
        });

        app.post("/api/v1/users/edit", (request, response)=> {
                ee.emit("db/user:editUser", new $Event(request.body))
                .then((userRecord)=> response.json({uid: userRecord.uid}))
                .catch(onError);
        });

        function onError(error) {
                console.error(error);
                return {
                        code: "user:error",
                        msg: error.message,
                        stack: error.stack.split("\n")
                };
        };
};

module.exports = userModule;

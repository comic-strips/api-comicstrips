
function JobQueue($imports) {
	let jobRunner;
	let isRunning = false;
	const jobQueue = [];

	function done(idx, fn) {
		jobQueue.splice(idx, 1);
		if (fn) { fn() };
	};

	function start(options) {
		if (!isRunning) {
			isRunning = true;
			jobRunner = setInterval(()=> {
				if (jobQueue.length === 0) {
					stop();
					return;
				}

				jobQueue.forEach((job, idx)=> {
					if (job.shouldStart()) { job.task(done.bind(null, idx)) };
				})
			}, options.interval || 5000);
		} else {
			console.warn("Queue is already running.");
			return 
		}
	};

	function stop() {
		console.log(`Queue stopped at ${new Date().toString()}`);
		clearInterval(jobRunner);
		isRunning = false;
	};

	function push(elementList) {
	    jobQueue.push(...elementList);
	    if (!isRunning) {
	      start({})
	    }
	    return;
  	};

	function queue() {
		return {
			queue: jobQueue, 
			size: jobQueue.length
		}
	};

	function push(elementList) {
	    jobQueue.push(...elementList);
	    if (!isRunning) {
	      start({})
	    }
	    return;
  	};
  	
	return {start, stop, queue, push}
};

module.exports = JobQueue;

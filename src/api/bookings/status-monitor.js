function statusMonitor($imports) {
  const {eventEmitter} = $imports;

  function watch(fn, timeout=10000) {
    setTimeout(fn, timeout);
  }

  return {watch}
}

module.exports = statusMonitor;
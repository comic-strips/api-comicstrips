function middleware() {
  const middlewareList = [];

  function register(middlewareFn) {
    middlewareList.push(middlewareFn);
  }

  function init(app) {
    app.use(middlewareList);
  }

  return {register, init}
}

module.exports = middleware;
(function () {
  window.exports = {};
  window.module = Object.defineProperty({}, "exports", {
    get: function () {
      return exports;
    },
    set: function (value) {
      exports = value;
    }
  });
  const loadedModules = {};
  let currentPath = window.location.pathname;
  window.require = function (name) {
    name = require.resolve(name);
    if (loadedModules[name]) {
      return loadedModules[name];
    }
    throw new Error('Module not found: ' + name);
  };
  require.resolve = function(name){
    if( loadedModules[name] ) {
      return name;
    }
    return new URL(name, currentPath).href + ".js";
  };
  Object.defineProperty(require, "cache", { get: () => loadedModules });
  window.loadModules = async function (moduleName, { dependencies, main }) {
    currentPath = window.location.href;
    const mainModulePath = new URL(main, currentPath).href;
    for (const name of [...dependencies, main]) {
      await new Promise((resolve) => {
        const script = window.document.createElement("script");
        const src = script.src = currentPath = new URL(name, currentPath).href;
        script.onload = function () {
          loadedModules[src] = exports;
          exports = {};
          resolve();
        };
        script.onerror = function () {
          console.error(new Error('Failed to load module: ' + name));
          resolve();
        };
        document.head.appendChild(script);
      });
    }
    loadedModules[moduleName] = loadedModules[mainModulePath];
    currentPath = window.location.href;
  }
})();

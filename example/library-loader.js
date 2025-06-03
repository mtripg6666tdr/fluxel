let fns = [];

window.doAfterLoad = function (fn) {
  fns.push(fn);
}

Promise.all([
  loadModules("create-element", {
    dependencies: [
      "../dist/tags__generated.js",
    ],
    main: "../dist/index.js",
  }),
]).then(() => fns.forEach(fn => fn()));

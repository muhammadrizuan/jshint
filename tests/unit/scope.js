"use strict";

var scope = require("../../src/scope.js");

// function main() {
// }

exports.testCreate = function (test) {
  var env = scope.create();

  test.equal(1, env.pool.length);
  test.equal(1, env.stack.length);
  test.equal("(global)", env.last().name);

  env.push("main", "func");
  test.equal(2, env.pool.length);
  test.equal(2, env.stack.length);
  test.equal("main", env.last().name);

  env.pop();
  test.equal(2, env.pool.length);
  test.equal(1, env.stack.length);

  test.equal(env.pool[0].children[0], 1);

  test.done();
};

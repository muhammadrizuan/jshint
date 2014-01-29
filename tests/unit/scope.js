"use strict";

var scope = require("../../src/scope.js");

// function main() {
//   if (true) {}
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

  env.push("if", "block");
  test.equal(3, env.pool.length);
  test.equal(3, env.stack.length);
  test.equal("if", env.last().name);

  env.pop();
  env.pop();
  test.equal(3, env.pool.length);
  test.equal(1, env.stack.length);

  test.deepEqual(env.pool[0].children, [1, 2]);
  test.deepEqual(env.pool[1].children, [2]);

  test.done();
};

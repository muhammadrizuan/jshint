"use strict";

var _ = require("lodash");
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

// function main() {
//   var a;
//   let b;
//   if (true) {
//      var c;
//      let d;
//   }
// }

exports.testDeclarations = function (test) {
  var env = scope.create();

  function isdecl(name) { return env.last().vars.decl[name] != null }

  env.push("main", "func");
  env.vardecl("a", "var");
  env.vardecl("b", "let");
  env.push("if", "block");
  env.vardecl("c", "var");
  env.vardecl("d", "let");

  test.ok(isdecl("d"));
  test.ok(!isdecl("c"));

  env.pop();
  test.ok(isdecl("a"));
  test.ok(isdecl("b"));
  test.ok(isdecl("c"));

  env.pop();
  test.strictEqual(_.size(env.last().vars.decl), 0);

  test.done();
};

// function main() {
//   b = 1;
//   if (true) a = 1;
//   var a;
//   function bar() { d = 1; }
//   var d;
//   var e;
// }

exports.testUses = function (test) {
  var env = scope.create();

  function getuse(name) { return env.last().vars.uses[name] }
  function getdecl(name) { return env.last().vars.decl[name] }

  env.push("main", "func");
  env.varuse("b");
  test.ok(getuse("b").decl == null);

  env.push("if", "block");
  env.varuse("a");
  test.ok(getuse("a").decl == null);
  env.pop();

  env.vardecl("a", "var");
  test.ok(!getdecl("a").unused);

  env.push("bar", "func");
  env.varuse("d");
  test.ok(getuse("d").decl == null);
  env.pop();

  env.vardecl("d");
  env.vardecl("e");
  test.ok(!getdecl("d").unused);
  test.ok(getdecl("e").unused);

  test.done();
};

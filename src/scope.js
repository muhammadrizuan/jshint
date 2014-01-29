"use strict";

var _ = require("lodash");

/*
var scope = [
  { name: "(global)", children: [1, 2, 3], vars: { a: "unused", b: "undefined", c: "ok" } },
  { name: "main", children: [ 2 ], vars: { d: "ok", e: "undefined" } },
  { name: "(anonymous)", children: [], { d: "ok", c: "ok" } }
];

var a = b + 1;

function main() {
  var d = 3;

  return function () {
    return d + c;
  }(e);
}

var c = 2;

*/

function concat(dest, src) {
  return Array.prototype.concat.apply(dest, src);
}

function create() {
  var env = push({ pool: [], stack: [] }, "(global)", "func");

  _.each(exports, function (fn, name) {
    env[name] = function () { return fn.apply(null, concat([ env ], arguments)) };
  });

  return env;
}

// type: string (func, block)
function push(env, name, type) {
  var id = env.pool.push({
    name: name,
    children: [],
    vars: { decl: {}, uses: {} },
    type: type
  }) - 1;

  env.stack.forEach(function (par) {
    env.pool[par].children.push(id);
  });

  env.stack.push(id);
  return env;
}

function pop(env) {
  env.stack.pop();
  return env;
}

function last(env, cond) {
  var id = _.findLast(env.stack, function (id) {
    return cond ? cond(env.pool[id]) : true;
  });

  return id != null ? env.pool[id] : null;
}

// type: string (var, let)
function vardecl(env, name, type) {
  // Get the last block from the stack. If variable is declared
  // with the "var" keyword, get the last function block.
  var cur = last(env, function (scope) {
    return type === "var" ? scope.type === "func" : true;
  });

  cur.vars.decl[name] = { type: type, unused: true, shadows: [] };

  // 1. add variable declaration to this scope. if type = var
  //    and we're in a block scope, add variable to the closest
  //    function scope.
  // 2. go thru this and child scopes and mark all undef uses
  //    as ok.
  // 3. go thru all parent scopes and mark all variable declarations
  //    with the same name as shadowed and unused (unless there are
  //    uses outside of the scope).
}

[ create, push, pop, last, vardecl ].forEach(function (fn) { exports[fn.name] = fn });

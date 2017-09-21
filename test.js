/**
 * QUnit testing dropin with the slowparse qunit tests
 */
var Slowparse = require("./slowparse.js"),
    window = {},
    JSDOM  = require("jsdom").JSDOM ,
    dom = new JSDOM("<!doctype html><html><head></head><body></body></html>"),
    window = dom.window,
    document = window.document,
    validators = require("./test/node/qunit-shim.js")(Slowparse, JSDOM);

console.log("Testing Slowparse library:");
var failureCount = require("./test/test-slowparse.js")(Slowparse, window, document, validators);
if (failureCount > 0) { console.log(failureCount + " tests failed."); }

process.exit(failureCount);

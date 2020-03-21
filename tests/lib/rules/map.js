/**
 * @fileoverview Native array map preference
 * @author Viacheslav Zinovev
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/map"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("map", rule, {
  valid: ["_.map({}, {} => {}))"],

  invalid: [
    {
      code: "_.map([0], () => {})))",
      errors: [
        {
          message: "Fill me in.",
          type: "Me too"
        }
      ]
    }
  ]
});

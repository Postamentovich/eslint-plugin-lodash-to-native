/**
 * @fileoverview Native array map preference
 * @author Viacheslav Zinovev
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/map");
const RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 6 } });
ruleTester.run("map", rule, {
    valid: ["_.map({}, () => {})"],
    invalid: [
        {
            code: "_.map([0], () => {})",
            errors: [
                {
                    message: "Prefer native Array.map method"
                }
            ]
        },
        {
            code: "let a = [0]; _.map(a, () => {})",
            errors: [
                {
                    message: "Prefer native Array.map method"
                }
            ]
        }
    ]
});

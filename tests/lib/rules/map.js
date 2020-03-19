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

    valid: [

        // give me some code that won't trigger a warning
    ],

    invalid: [
        {
            code: "_.map(Array, fn))",
            errors: [{
                message: "Fill me in.",
                type: "Me too"
            }]
        }
    ]
});

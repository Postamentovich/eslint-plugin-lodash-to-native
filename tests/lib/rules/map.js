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
    valid: [
        /** Если объект объявлен явно, код считается валидным */
        "_.map({}, () => {})",
        /** Если _ был переопределён, то правило не должно срабатывать после переопределения */
        "_ = {map: () => []}; _.map([0], () => {})"
    ],
    invalid: [
        {
            /** Если при вызове явно указан литерал массива, то фикс должен генерировать код без проверки, что параметр - это массив */
            code: "_.map([0], () => {})",
            output: "[0].map(() => {})",
            errors: [
                {
                    message: "Prefer native Array.map method"
                }
            ]
        },
        {
            code: "_.map(collection, () => {})",
            output:
                "Array.isArray(collection) ? collection.map(() => {}) : _.map(collection, () => {})",
            errors: [
                {
                    message: "Prefer native Array.map method"
                }
            ]
        },
        {
            code: "const _ = require('lodash'); _.map([0], () => {})",
            output: "const _ = require('lodash'); [0].map(() => {})",
            errors: [
                {
                    message: "Prefer native Array.map method"
                }
            ]
        }
    ]
});

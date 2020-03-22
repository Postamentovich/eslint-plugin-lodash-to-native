/**
 * @fileoverview Native Array map preference
 * @author Viacheslav Zinovev
 */
"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const ARRAY_TYPES = new Set(["ArrayExpression"]);
const OBJECT_TYPES = new Set(["ObjectExpression", "ObjectPattern"]);
const CONDITION_TYPES = new Set([
    "IfStatement",
    "WhileStatement",
    "DoWhileStatement",
    "ForStatement",
    "ConditionalExpression"
]);

/**
 * Checks whether a given node is a Array node or not.
 *
 * @param {ASTNode} node node to check
 * @returns {boolean} `true` if the node is a Array node.
 */
function isArrayType(node) {
    return Boolean(node && ARRAY_TYPES.has(node.type));
}

/**
 * Check whether an AST node is inside conditional statement.
 * @param {!Object} node The node to test.
 * @returns {boolean} `true` if the node is the text expression for a conditional statement; otherwise, `false`.
 */
function isInsideConditionalExpression(node) {
    return node.parent && CONDITION_TYPES.has(node.parent.type);
}

/**
 * Determines if a node is an object type
 * @param {ASTNode} node The node to check.
 * @returns {boolean} Whether or not the node is an object type.
 */
function isObjectType(node) {
    return node && OBJECT_TYPES.has(node.type);
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Native Array map preference",
            category: "Fill me in",
            recommended: false
        },
        fixable: "code"
    },

    create(context) {
        let isOverwrite = false;

        const checkNode = node => {
            const { arguments: args, callee } = node;

            const objectName = callee.object && callee.object.name;

            const propertyName = callee.property && callee.property.name;

            if (isOverwrite) return null;

            if (isInsideConditionalExpression(node)) return null;

            if (objectName === "_" && propertyName === "map") {
                const sourceCode = context.getSourceCode();

                const firstArgument = args[0];

                const secondArgument = args[1];

                /**
                 * Create report with fix
                 *
                 * @param {boolean} withoutCondition - add contional test or not
                 */
                const report = withoutCondition => {
                    const source = sourceCode.getText(node);

                    const array = sourceCode.getText(firstArgument);

                    const callback = sourceCode.getText(secondArgument);

                    const nativeMap = `${array}.map(${callback})`;

                    const replacer = withoutCondition
                        ? nativeMap
                        : `Array.isArray(${array}) ? ${nativeMap} : ${source}`;

                    context.report({
                        node: node.callee.property,
                        message: "Prefer native Array.map method",
                        fix(fixer) {
                            return fixer.replaceText(node, replacer);
                        }
                    });
                };

                /**
                 * Изначально, начал проверять аргументы через scope,
                 * являются первый аргумент массивом или нет, и является ли второй аргумент функцией
                 * потом понял что очень много краевых случаев, и перемнные многими способами можно переопределить,
                 * в итоге отказался от этих проверок, и оставил только на литерал массива и литерал объекта
                 */
                if (firstArgument && secondArgument) {
                    /**
                     * Проверяем является первый аргумент объектом или нет,
                     * если это объект сообщение об ошибке генерироваться не будет
                     */
                    if (isObjectType(firstArgument)) return null;

                    /**
                     * Проверяем является первый аргумент массивом или нет,
                     * если это массив генируется сообщение об ошибке и предлагается fix без проверки на массив
                     */
                    if (isArrayType(firstArgument)) return report(true);

                    /**
                     * Генируется сообщение об ошибке и предлагается fix с проверкой на массив
                     */
                    return report();
                }
            }
        };

        /**
         * Проверяем был переопределена переменная "_" в проекте или нет.
         * Если переменная переопределена сообщение об ошибке генерироваться не будет
         *
         * @param {ASTNode} node
         */
        const checkExpression = node => {
            if (node.left.name === "_") isOverwrite = true;
        };

        return {
            CallExpression: checkNode,
            AssignmentExpression: checkExpression
        };
    }
};

/**
 * @fileoverview Native Array map preference
 * @author Viacheslav Zinovev
 */
"use strict";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const anyFunctionPattern = /^(?:Function(?:Declaration|Expression)|ArrowFunctionExpression)$/u;
const arrayOrTypedArrayPattern = /ArrayExpression$/u;
const TEST_CONDITION_PARENT_TYPES = new Set([
    "IfStatement",
    "WhileStatement",
    "DoWhileStatement",
    "ForStatement",
    "ConditionalExpression"
]);

/**
 * Checks whether a given node is a function node or not.
 *
 * @param {ASTNode} node node to check
 * @returns {boolean} `true` if the node is a function node.
 */
function isFunction(node) {
    return Boolean(node && anyFunctionPattern.test(node.type));
}

/**
 * Checks whether a given node is a Array node or not.
 *
 * @param {ASTNode} node node to check
 * @returns {boolean} `true` if the node is a Array node.
 */
function isArray(node) {
    return Boolean(node && arrayOrTypedArrayPattern.test(node.type));
}

/**
 * Finds the variable by a given name in a given scope and its upper scopes.
 * @param {eslint-scope.Scope} initScope A scope to start find.
 * @param {string} name A variable name to find.
 * @returns {eslint-scope.Variable|null} A found variable or `null`.
 */
function getVariableByName(initScope, name) {
    let scope = initScope;

    while (scope) {
        const variable = scope.set.get(name);

        if (variable) {
            return variable;
        }

        scope = scope.upper;
    }

    return null;
}

/**
 * Check whether an AST node is the test expression for a conditional statement.
 * @param {!Object} node The node to test.
 * @returns {boolean} `true` if the node is the text expression for a conditional statement; otherwise, `false`.
 */
function isConditionalExpression(node) {
    return node.parent && TEST_CONDITION_PARENT_TYPES.has(node.parent.type);
}

function getNodeByVariable(variable) {
    const { identifiers } = variable;

    return identifiers[0].parent.init;
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
        const checkNode = node => {
            const {
                arguments: args,
                callee: {
                    object: { name },
                    property: { name: methodName }
                }
            } = node;

            console.log(node);

            if (!isConditionalExpression(node)) {
                console.log("test");

                const sourceCode = context.getSourceCode();

                let scope = context.getScope();

                if (name === "_" && methodName === "map") {
                    const firstArgument = args[0];

                    const secondArgument = args[1];

                    const report = withoutCondition => {
                        const source = sourceCode.getText(node);

                        const array = sourceCode.getText(firstArgument);

                        const callback = sourceCode.getText(secondArgument);

                        const nativeMap = `${array}.map(${callback})`;

                        console.log("report");

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

                    if (firstArgument && secondArgument) {
                        if (
                            isArray(firstArgument) &&
                            isFunction(secondArgument)
                        ) {
                            report(true);
                        } else {
                            let firstArgumentIsArray = false;

                            let secondArgumentIsFunction = false;

                            if (isArray(firstArgument)) {
                                firstArgumentIsArray = true;
                            } else if (firstArgument.type === "Identifier") {
                                const variable = getVariableByName(
                                    scope,
                                    firstArgument.name
                                );
                                if (variable) {
                                    const node = getNodeByVariable(variable);
                                    firstArgumentIsArray = isArray(node);
                                }
                            }

                            if (isFunction(secondArgument)) {
                                secondArgumentIsFunction = true;
                            } else if (secondArgument.type === "Identifier") {
                                const variable = getVariableByName(
                                    scope,
                                    secondArgument.name
                                );
                                if (variable) {
                                    const node = getNodeByVariable(variable);
                                    secondArgumentIsFunction = isFunction(node);
                                }
                            }

                            if (
                                firstArgumentIsArray &&
                                secondArgumentIsFunction
                            ) {
                                report();
                            }
                        }
                    }
                }
            }
        };

        return {
            CallExpression: checkNode
        };
    }
};

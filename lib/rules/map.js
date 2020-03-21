/**
 * @fileoverview Native array map preference
 * @author Viacheslav Zinovev
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: "Native array map preference",
      category: "Fill me in",
      recommended: false
    },
    fixable: null, // or "code" or "whitespace"
    schema: [
      // fill in your schema
    ]
  },

  create: function(context) {
    const anyFunctionPattern = /^(?:Function(?:Declaration|Expression)|ArrowFunctionExpression)$/u;
    const arrayOrTypedArrayPattern = /Array$/u;

    function isFunction(node) {
      return Boolean(node && anyFunctionPattern.test(node.type));
    }

    return {
      CallExpression: node => {
        const {
          arguments: args,
          callee: {
            object: { name },
            property: { name: methodName }
          }
        } = node;

        const sourceCode = context.getSourceCode();

        const {
          scopeManager: { scopes }
        } = sourceCode;

        const isArray = node => {
          if (node.type === "ArrayExpression") return true;

          const { name } = node;

          let result = false;

          scopes.forEach(scope => {
            scope.references.forEach(reference => {
              const { resolved } = reference;
              if (resolved) {
                if (resolved.name === name) {
                  const { identifiers } = resolved;

                  if (identifiers[0].parent.init.type === "ArrayExpression") {
                    result = true;
                  }
                }
              }
            });
          });
          return result;
        };

        if (name === "_" && methodName === "map") {
          const firstArgument = args[0];

          const secondArgument = args[1];

          if (isArray(firstArgument) && isFunction(secondArgument)) {
            const callback = sourceCode.getText(secondArgument);

            const array = sourceCode.getText(firstArgument);

            const replacer = `${array}.map(${callback})`;

            context.report({
              node: node.callee.property,
              message: "Missing semicolon",
              fix(fixer) {
                return fixer.replaceText(node, replacer);
              }
            });
          }
        }
      }
    };
  }
};

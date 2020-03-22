# Native Array.map preference (map)

## Rule Details

This rule aims to use native arrays methods prefer lodash methods.

Examples of **incorrect** code for this rule:

```js

_.map([], () => {})

```

Examples of **correct** code for this rule:

```js

[].map(() => {})

```
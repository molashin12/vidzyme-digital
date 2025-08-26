module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "single", {"allowTemplateLiterals": true}],
    "max-len": ["error", {"code": 120}],
    "object-curly-spacing": ["error", "always"],
    "comma-dangle": ["error", "never"],
    "require-jsdoc": "off",
    "valid-jsdoc": "off"
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
};
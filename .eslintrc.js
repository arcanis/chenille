module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "modules": true,
    },
  },
  "plugins": [
    "header"
  ],
  "rules": {
    "header/header": [2, "header.js"]
  },
};

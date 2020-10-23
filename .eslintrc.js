module.exports = {
  root: true,
  env: {
    browser : true,
    es6: true,
    jest: true,
    node: true,
  },

  parserOptions: {
    sourceType: 'module',
  },
  globals: {
    window: 'readonly',
    document: 'readonly'
  },

  extends: [
    'eslint:recommended',
  ],
};
module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: 'airbnb',
  rules: {
    'linebreak-style': 'off',
    'max-len': ['warn', { code: 175 }],
  },
};

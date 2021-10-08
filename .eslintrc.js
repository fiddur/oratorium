module.exports = {
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: 11,
  },
  extends: 'airbnb-base',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
}

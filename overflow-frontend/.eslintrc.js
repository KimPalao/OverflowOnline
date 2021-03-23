module.exports = {
  plugins: [
    '@typescript-eslint',
    'vue',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    '@vue/typescript'
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off"
  }
}
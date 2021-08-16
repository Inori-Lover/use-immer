module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["plugin:react-hooks/recommended"],
  rules: {
    "object-shorthand": ["warn"],
    "no-useless-rename": ["warn"],
    "@typescript-eslint/no-duplicate-imports": ["warn"],
  },
};

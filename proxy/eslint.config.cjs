const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  {
    ignores: ["node_modules/**", "coverage/**", "dist/**", "dist-test/**", ".vercel/**"]
  },
  ...expoConfig,
  {
    rules: {
      "import/no-unresolved": [
        "error",
        {
          ignore: ["@google/genai"]
        }
      ]
    }
  }
];

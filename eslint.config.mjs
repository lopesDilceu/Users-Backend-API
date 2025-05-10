import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser, // <----- ESSENCIAL
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    ...tseslint.configs.recommended[0], // ou use tseslint.configs.recommendedFlat se quiser a versão flat completa
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // <- Coloque isso aqui DEPOIS do spread
    },
  },
]);

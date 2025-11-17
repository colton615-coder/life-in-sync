import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact_hooks from "eslint-plugin-react-hooks";
import pluginReact_refresh from "eslint-plugin-react-refresh";
import eslint from "@eslint/js";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': pluginReact_hooks,
      'react-refresh': pluginReact_refresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
];

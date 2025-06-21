import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import boundaries from 'eslint-plugin-boundaries';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "build/",
      ".DS_Store",
      "*.pem"
    ]
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: {
      boundaries
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      // Boundaries rules to enforce feature slice architecture
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "features",
              allow: ["lib", "types", "components"]
            },
            {
              from: "app",
              allow: ["features", "lib", "types", "components"]
            },
            {
              from: "components",
              allow: ["lib", "types"]
            }
          ]
        }
      ]
    },
    settings: {
      "boundaries/elements": [
        {
          type: "features",
          pattern: "src/features/*"
        },
        {
          type: "app",
          pattern: "src/app/*"
        },
        {
          type: "components",
          pattern: "src/components/*"
        },
        {
          type: "lib",
          pattern: "src/lib/*"
        },
        {
          type: "types",
          pattern: "src/types/*"
        }
      ]
    }
  }
];

export default eslintConfig;

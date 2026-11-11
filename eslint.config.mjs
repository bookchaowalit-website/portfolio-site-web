import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // A config object with `ignores` alongside other keys (like `rules`) only
  // scopes those specific rules — it does NOT globally exclude files from
  // every other config object. A global ignore must be its own object with
  // *only* `ignores`. Previously this list lived inside the rules-override
  // object below, so it never actually excluded anything from
  // next/core-web-vitals or next/typescript — next-env.d.ts (auto-generated)
  // and public/sw.js (compiled output, not source) were being linted as if
  // they were hand-written source, producing 10,000+ false-positive
  // problems that buried any real signal. See PRODUCT.md.
  {
    ignores: [
      "node_modules/**",
      "storybook-static/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "public/sw.js",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;

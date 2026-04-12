import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local ad hoc scripts are not part of the Next.js app surface.
    "check_db.js",
    "check_gallery.js",
    "inspect_gallery.js",
    "new file",
  ]),
  {
    rules: {
      // Existing app code relies on broad JSON/error payloads in several routes and clients.
      "@typescript-eslint/no-explicit-any": "off",
      // Preserve authoring style in current marketing/admin copy.
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;

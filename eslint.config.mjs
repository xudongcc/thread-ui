import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { plugin as shadcn } from "@shadcn/lint";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config['rules']} */
const importRules = {
  "sort-imports": ["error", { ignoreDeclarationSort: true }],
  "@typescript-eslint/consistent-type-imports": [
    "error",
    { prefer: "type-imports" },
  ],
  "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
  "import/first": "error",
  "import/newline-after-import": "error",
  "import/no-commonjs": "error",
  "import/no-duplicates": "error",
  "import/order": [
    "error",
    {
      groups: [
        "builtin",
        "external",
        "internal",
        "parent",
        "sibling",
        "index",
        "object",
        "type",
      ],
    },
  ],
};

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/.vercel/**",
      "**/out/**",
      "**/build/**",
      "**/dist/**",
      "**/storybook-static/**",
      "**/coverage/**",
      "**/.source/**",
      "packages/shadcn-ui/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends("turbo"),
  ...compat.extends("prettier"),
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,
  {
    plugins: {
      import: importPlugin,
      shadcn,
    },
    rules: {
      ...importRules,
      "@next/next/no-html-link-for-pages": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react/jsx-sort-props": [
        "error",
        {
          callbacksLast: true,
          shorthandFirst: true,
          ignoreCase: true,
          reservedFirst: true,
          noSortAlphabetically: false,
          multiline: "last",
        },
      ],
    },
    settings: {
      next: {
        rootDir: ["apps/*/"],
      },
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["apps/storybook/stories/**/*.{ts,tsx}"],
    settings: {
      shadcn: {
        ui: ["@/components/ui", "@/components/thread-ui"],
        componentImports: ["^@repo/"],
      },
    },
    rules: {
      "shadcn/no-restyle": [
        "warn",
        {
          allow: ["layout"],
          contracts: [
            // Content containers let consumers arrange and space their children.
            {
              pattern: "^(Page|PageContent|CardContent)$",
              allow: ["layout", "spacing"],
            },
            // A card with a custom media header needs the same flush top as an image.
            { pattern: "^Card$", allow: ["layout", "pt-0"] },
            // Sidebar content spacing and the gutter for an adjacent menu badge.
            { pattern: "^SidebarContent$", allow: ["layout", "py-2"] },
            { pattern: "^SidebarMenuButton$", allow: ["layout", "pr-12"] },
            // The navigation trigger follows the Topbar's locally scoped theme.
            {
              pattern: "^SidebarTrigger$",
              allow: [
                "layout",
                "text-foreground",
                "hover:bg-accent",
                "hover:text-accent-foreground",
                "focus-visible:ring-ring",
                "aria-expanded:bg-accent",
                "aria-expanded:text-accent-foreground",
                "dark:hover:bg-accent",
              ],
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;

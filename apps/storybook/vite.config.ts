import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfig from "./tsconfig.json" with { type: "json" };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // These dependencies live in linked workspace packages. Prebundle them at
    // startup so opening a new story cannot invalidate modules already in use.
    include: [
      "@repo/shadcn-ui > @base-ui/react",
      "@repo/shadcn-ui > @base-ui/react/menu",
      "@repo/shadcn-ui > @base-ui/react/radio",
      "@repo/shadcn-ui > @base-ui/react/radio-group",
      "@repo/shadcn-ui > @base-ui/react/tooltip",
      "@repo/data-filter > lodash-es",
      "@repo/data-table > @tanstack/react-table",
      "@repo/code-block > @radix-ui/react-use-controllable-state",
      "@repo/code-block > @shikijs/transformers",
      "@repo/code-block > react-icons/si",
      "@repo/code-block > shiki",
      "@repo/number-input > react-number-format",
      "@repo/file-upload > p-queue",
    ],
  },
  resolve: {
    // Apply the same aliases to stories and imported workspace source files.
    alias: Object.entries(tsconfig.compilerOptions.paths).map(
      ([find, [path]]) => ({
        find: find.replace(/\/\*$/, ""),
        replacement: fileURLToPath(
          new URL(path.replace(/\/\*$/, ""), import.meta.url),
        ),
      }),
    ),
    dedupe: ["react", "react-dom"],
  },
});

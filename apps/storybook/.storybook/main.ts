import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-themes",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@chromatic-com/storybook",
  ],
  // Storybook replaces vite.config.ts's server options before viteFinal runs.
  viteFinal: (config) =>
    mergeConfig(config, {
      server: {
        watch: { ignored: [/(^|[/\\])storybook-static([/\\]|$)/] },
      },
    }),
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      tsconfigPath: fileURLToPath(
        new URL("../tsconfig.docgen.json", import.meta.url),
      ),
      include: [
        fileURLToPath(new URL("../../../components/**/*.tsx", import.meta.url)),
        fileURLToPath(
          new URL("../../../packages/shadcn-ui/**/*.tsx", import.meta.url),
        ),
      ],
      exclude: ["**/node_modules/**", "**/__tests__/**"],
    },
  },
};

export default config;

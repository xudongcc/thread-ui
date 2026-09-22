import { withThemeByClassName } from "@storybook/addon-themes";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@repo/locales/en/thread-ui.json";
import zh from "@repo/locales/zh/thread-ui.json";
import type { Preview } from "@storybook/react-vite";

import { AppProvider } from "@/components/thread-ui/app-provider";
import "../styles.css";

// Separate instances keep stories with different locales independent in Autodocs.
const i18nInstances = { en: createInstance(), zh: createInstance() };
await Promise.all(
  Object.entries(i18nInstances).map(([lng, instance]) =>
    instance.use(initReactI18next).init({
      lng,
      fallbackLng: "en",
      ns: ["thread-ui"],
      interpolation: { escapeValue: false },
      resources: {
        en: { "thread-ui": en },
        zh: { "thread-ui": zh },
      },
    }),
  ),
);

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { codePanel: true },
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },

    options: {
      storySort: {
        method: "alphabetical",
        order: [
          "Introduction",
          "API Usage",
          "Foundations",
          "Actions",
          "Forms",
          "Data",
          "Display",
          "Feedback",
          "Layout",
        ],
      },
    },

    a11y: {
      // Run accessibility checks alongside component tests in Vitest and CI.
      test: "error",
    },
  },
  globalTypes: {
    locale: {
      description: "Component language",
      toolbar: {
        icon: "globe",
        dynamicTitle: true,
        items: [
          { value: "en", title: "English" },
          { value: "zh", title: "中文" },
        ],
      },
    },
  },
  initialGlobals: { locale: "en" },
  loaders: [
    async ({ globals, viewMode }) => {
      const locale = globals.locale === "zh" ? "zh" : "en";
      if (viewMode === "story") document.documentElement.lang = locale;
    },
  ],
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
    (Story, { globals }) => (
      <AppProvider i18n={i18nInstances[globals.locale === "zh" ? "zh" : "en"]}>
        <Story />
      </AppProvider>
    ),
  ],
};

export default preview;

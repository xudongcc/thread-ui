"use client";

import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../../../locales/en/thread-ui.json";
import zh from "../../../locales/zh/thread-ui.json";
import type { ReactNode } from "react";

import { AppProvider } from "@/components/thread-ui/app-provider";

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  lng: "en",
  ns: ["thread-ui"],
  resources: {
    en: {
      "thread-ui": en,
    },
    zh: {
      "thread-ui": zh,
    },
  },
});

export const Providers = ({ children }: { children: ReactNode }) => {
  return <AppProvider i18n={i18n}>{children}</AppProvider>;
};

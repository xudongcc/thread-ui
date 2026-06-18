import { cleanup, render, screen } from "@testing-library/react";
import { createInstance } from "i18next";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import en from "@repo/locales/en/thread-ui.json";
import zh from "@repo/locales/zh/thread-ui.json";
import { Calendar } from "../index";
import { AppProvider } from "@/components/thread-ui/app-provider";

const createI18n = (language = "en") => {
  const i18n = createInstance();

  void i18n.init({
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    initAsync: false,
    lng: language,
    ns: ["thread-ui"],
    resources: {
      en: {
        "thread-ui": structuredClone(en),
      },
      zh: {
        "thread-ui": structuredClone(zh),
      },
    },
  });

  return i18n;
};

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
});

describe("Calendar", () => {
  it("passes the AppProvider language locale to the shadcn calendar", () => {
    const selectedDate = new Date("2025-03-15T00:00:00.000Z");
    const localizedDate = selectedDate.toLocaleDateString("zh");

    render(
      <AppProvider i18n={createI18n("zh")}>
        <Calendar mode="single" month={selectedDate} selected={selectedDate} />
      </AppProvider>,
    );

    expect(screen.getByRole("grid")).toBeTruthy();
    expect(
      document.querySelector(`[data-day="${localizedDate}"]`),
    ).toBeTruthy();
  });

  it("builds the DayPicker locale from i18next resources", () => {
    const i18n = createI18n("en");

    i18n.addResourceBundle(
      "en",
      "thread-ui",
      {
        calendar: {
          weekdays: {
            short: ["SUX", "MOX", "TUX", "WEX", "THX", "FRX", "SAX"],
          },
        },
      },
      true,
      true,
    );

    render(
      <AppProvider i18n={i18n}>
        <Calendar mode="single" month={new Date("2025-03-15")} />
      </AppProvider>,
    );

    expect(screen.getByText("SUX")).toBeTruthy();
    expect(screen.getByText("MOX")).toBeTruthy();
  });
});

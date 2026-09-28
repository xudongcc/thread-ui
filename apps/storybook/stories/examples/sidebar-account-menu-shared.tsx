import { LanguagesIcon, SunMoonIcon } from "lucide-react";
import * as React from "react";
import * as ReactI18next from "react-i18next";
import type { SidebarAccountMenuProps } from "@/components/thread-ui/sidebar-account-menu";
import {
  SidebarAccountMenuRadioGroup,
  SidebarAccountMenuRadioItem,
  SidebarAccountMenuSub,
  SidebarAccountMenuSubContent,
  SidebarAccountMenuSubTrigger,
} from "@/components/thread-ui/sidebar-account-menu";

export type SidebarAccountMenuExampleProps = Pick<
  SidebarAccountMenuProps,
  "user" | "loading" | "disabled"
>;

// A router-like Link for this standalone demo. In an app, import your router's Link.
// React 19 passes ref as a prop; forward all received props to the anchor.
export function DemoLink({
  to,
  onClick,
  ...props
}: React.ComponentProps<"a"> & { to: string }) {
  return (
    <a
      {...props}
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (
          !event.defaultPrevented &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault();
          // Simulate client-side routing without navigating the Storybook/test host.
          window.history.replaceState(null, "", to);
        }
      }}
    />
  );
}

const ExampleThemeContext = React.createContext("light");

// Keep language and theme state outside the popup so closing it preserves preferences.
export function AccountMenuExampleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = React.useState("light");
  React.useEffect(() => {
    const root = document.documentElement;
    const original = root.classList.contains("dark");
    const sync = () =>
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
      root.classList.toggle("dark", original);
    };
  }, []);
  const { i18n } = ReactI18next.useTranslation();
  const instance = React.useMemo(() => i18n.cloneInstance(), [i18n]);
  return (
    <ReactI18next.I18nextProvider i18n={instance}>
      <ExampleThemeContext.Provider value={theme}>
        {children}
      </ExampleThemeContext.Provider>
    </ReactI18next.I18nextProvider>
  );
}

// Preferences are ordinary composed items. Applications own persistence.
export function AccountMenuPreferences() {
  const { t, i18n } = ReactI18next.useTranslation("thread-ui");
  const theme = React.useContext(ExampleThemeContext);
  return (
    <>
      <SidebarAccountMenuSub>
        <SidebarAccountMenuSubTrigger className="min-h-10">
          <LanguagesIcon aria-hidden="true" />
          {t("sidebarAccountMenu.language")}
        </SidebarAccountMenuSubTrigger>
        <SidebarAccountMenuSubContent>
          <SidebarAccountMenuRadioGroup
            value={i18n.resolvedLanguage ?? "en"}
            onValueChange={(next: string) => {
              void i18n.changeLanguage(next);
            }}
          >
            <SidebarAccountMenuRadioItem
              closeOnClick
              className="min-h-10"
              value="en"
            >
              English
            </SidebarAccountMenuRadioItem>
            <SidebarAccountMenuRadioItem
              closeOnClick
              className="min-h-10"
              value="zh"
            >
              中文
            </SidebarAccountMenuRadioItem>
          </SidebarAccountMenuRadioGroup>
        </SidebarAccountMenuSubContent>
      </SidebarAccountMenuSub>
      <SidebarAccountMenuSub>
        <SidebarAccountMenuSubTrigger className="min-h-10">
          <SunMoonIcon aria-hidden="true" />
          {t("sidebarAccountMenu.theme")}
        </SidebarAccountMenuSubTrigger>
        <SidebarAccountMenuSubContent>
          <SidebarAccountMenuRadioGroup
            value={theme}
            onValueChange={(next: string) =>
              document.documentElement.classList.toggle("dark", next === "dark")
            }
          >
            <SidebarAccountMenuRadioItem
              closeOnClick
              className="min-h-10"
              value="light"
            >
              {i18n.language === "zh" ? "浅色" : "Light"}
            </SidebarAccountMenuRadioItem>
            <SidebarAccountMenuRadioItem
              closeOnClick
              className="min-h-10"
              value="dark"
            >
              {i18n.language === "zh" ? "深色" : "Dark"}
            </SidebarAccountMenuRadioItem>
          </SidebarAccountMenuRadioGroup>
        </SidebarAccountMenuSubContent>
      </SidebarAccountMenuSub>
    </>
  );
}

import { afterEach, beforeAll, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import type { Root } from "react-dom/client";
import {
  Layout,
  LayoutContent,
  LayoutSidebar,
} from "@/components/thread-ui/layout";
import { SidebarContent } from "@/components/ui/sidebar";
import "../styles.css";

const i18n = createInstance();
beforeAll(async () => {
  await i18n.init({ lng: "en", resources: {} });
});
let root: Root | undefined;
let container: HTMLDivElement;
afterEach(() => {
  if (root) flushSync(() => root!.unmount());
  root = undefined;
  container?.remove();
});
function Navigation({ fixed = false }: { fixed?: boolean }) {
  return (
    <LayoutSidebar collapsible={fixed ? "none" : "icon"}>
      <SidebarContent>Navigation links</SidebarContent>
    </LayoutSidebar>
  );
}
function render(showSidebar: boolean, fixed = false) {
  if (!root) {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  }
  flushSync(() =>
    root!.render(
      <StrictMode>
        <I18nextProvider i18n={i18n}>
          <Layout>
            {showSidebar && <Navigation fixed={fixed} />}
            <LayoutContent>
              <div className="h-500 shrink-0">Long content</div>
            </LayoutContent>
          </Layout>
        </I18nextProvider>
      </StrictMode>,
    ),
  );
}
const contentPadding = () =>
  getComputedStyle(
    container.querySelector('[data-slot="layout-content-body"]')!,
  ).paddingBottom;

test("composed sidebar adds floating navigation and scroll padding, then cleans up when removed", async () => {
  await page.viewport(375, 812);
  render(false);
  expect(contentPadding()).toBe("0px");
  await expect
    .element(page.getByRole("button", { name: "Toggle Sidebar" }))
    .not.toBeInTheDocument();
  render(true);
  const trigger = page.getByRole("button", { name: "Toggle Sidebar" });
  await expect.element(trigger).toBeVisible();
  await expect.poll(contentPadding).toBe("80px");
  const viewport = container.querySelector(
    '[data-slot="layout-content-viewport"]',
  )!;
  expect(viewport.getBoundingClientRect().height).toBe(812);
  const y = trigger.element().getBoundingClientRect().y;
  viewport.scrollTop = 300;
  expect(trigger.element().getBoundingClientRect().y).toBe(y);
  await trigger.click();
  await expect.element(page.getByRole("dialog")).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  render(false);
  await expect.element(trigger).not.toBeInTheDocument();
  await expect.poll(contentPadding).toBe("0px");
});

test("desktop has no floating navigation or reserved padding", async () => {
  await page.viewport(1280, 900);
  render(true);
  await expect
    .poll(() => {
      const navigation = container.querySelector(
        '[data-slot="layout-mobile-navigation"]',
      );
      return navigation ? getComputedStyle(navigation).display : null;
    })
    .toBe("none");
  expect(contentPadding()).toBe("0px");
  expect(container.querySelector('[data-slot="sidebar"]')).not.toBeNull();
});

test("non-collapsible sidebar does not add a drawer trigger or padding", async () => {
  await page.viewport(375, 812);
  render(true, true);
  await expect
    .element(page.getByRole("button", { name: "Toggle Sidebar" }))
    .not.toBeInTheDocument();
  expect(contentPadding()).toBe("0px");
});

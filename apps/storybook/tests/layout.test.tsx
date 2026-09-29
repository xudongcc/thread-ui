import { afterEach, beforeAll, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { StrictMode, createRef } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import type { Root } from "react-dom/client";
import {
  Layout,
  LayoutContent,
  LayoutSidebar,
  LayoutSidebarHeader,
  LayoutSidebarLogo,
  LayoutSidebarTitle,
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

test.each([true, false])(
  "sidebar header forwards native props with logo=%s",
  async (showLogo) => {
    await page.viewport(1280, 900);
    render(false);
    const headerRef = createRef<HTMLDivElement>();
    const logoRef = createRef<HTMLSpanElement>();
    const titleRef = createRef<HTMLSpanElement>();
    flushSync(() =>
      root!.render(
        <I18nextProvider i18n={i18n}>
          <Layout>
            <LayoutSidebar collapsible="icon">
              <LayoutSidebarHeader ref={headerRef} aria-label="Brand header">
                {showLogo && (
                  <LayoutSidebarLogo ref={logoRef} data-testid="brand-logo">
                    T
                  </LayoutSidebarLogo>
                )}
                <LayoutSidebarTitle ref={titleRef} title="Thread UI">
                  Thread UI
                </LayoutSidebarTitle>
              </LayoutSidebarHeader>
            </LayoutSidebar>
            <LayoutContent>Content</LayoutContent>
          </Layout>
        </I18nextProvider>,
      ),
    );
    expect(headerRef.current).toHaveAttribute("aria-label", "Brand header");
    expect(titleRef.current).toHaveAttribute("title", "Thread UI");
    if (showLogo)
      expect(logoRef.current).toHaveAttribute(
        "data-slot",
        "layout-sidebar-logo",
      );
    await page.getByRole("button", { name: "Collapse navigation" }).click();
    await expect
      .poll(() => getComputedStyle(titleRef.current!).display)
      .toBe("none");
    const expand = page.getByRole("button", { name: "Expand navigation" });
    if (!showLogo)
      expect(getComputedStyle(expand.element().parentElement!).opacity).toBe(
        "1",
      );
    await expand.click();
    await expect
      .poll(() => getComputedStyle(titleRef.current!).display)
      .not.toBe("none");
  },
);

test.each([375, 1280])(
  "fixed sidebar header has no toggle at %s px",
  async (width) => {
    await page.viewport(width, 900);
    render(false);
    flushSync(() =>
      root!.render(
        <I18nextProvider i18n={i18n}>
          <Layout>
            <LayoutSidebar collapsible="none">
              <LayoutSidebarHeader>
                <LayoutSidebarTitle>Thread UI</LayoutSidebarTitle>
              </LayoutSidebarHeader>
            </LayoutSidebar>
            <LayoutContent>Content</LayoutContent>
          </Layout>
        </I18nextProvider>,
      ),
    );
    await expect.element(page.getByText("Thread UI")).toBeVisible();
    expect(container.querySelector('[data-slot="sidebar-trigger"]')).toBeNull();
  },
);

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

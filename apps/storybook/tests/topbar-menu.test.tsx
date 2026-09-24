import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createRef } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import type { CSSProperties, ReactNode } from "react";
import type { Root } from "react-dom/client";
import type { TopbarMenuTriggerProps } from "@/components/thread-ui/topbar";
import {
  Topbar,
  TopbarAction,
  TopbarMenu,
  TopbarMenuContent,
  TopbarMenuTrigger,
  TopbarMenuUser,
  TopbarMenuWorkspaceGroup,
  TopbarMenuWorkspaceItem,
  TopbarSidebarTrigger,
} from "@/components/thread-ui/topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AvatarImage } from "@/components/ui/avatar";
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
  document.documentElement.classList.remove("dark");
});
function mount(children: ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  flushSync(() =>
    root!.render(<I18nextProvider i18n={i18n}>{children}</I18nextProvider>),
  );
}
function menu(triggerProps: TopbarMenuTriggerProps = {}, loading = false) {
  return (
    <Topbar>
      <TopbarMenu loading={loading} user={{ name: "Alex Morgan" }}>
        <TopbarMenuTrigger {...triggerProps} />
        <TopbarMenuContent>
          <TopbarMenuUser onClick={() => {}} />
        </TopbarMenuContent>
      </TopbarMenu>
    </Topbar>
  );
}

for (const width of [375, 1280]) {
  for (const mode of ["element", "function"] as const) {
    test(`${mode} render keeps layout, menu state, events and ref at ${width}px`, async () => {
      await page.viewport(width, 800);
      const ref = createRef<HTMLButtonElement>();
      const onClick = vi.fn();
      const render: TopbarMenuTriggerProps["render"] =
        mode === "element" ? (
          <button />
        ) : (
          (props, state) => <button {...props} data-render-open={state.open} />
        );
      mount(menu({ render, ref, onClick }));
      const trigger = page.getByRole("button", {
        name: "Account: Alex Morgan",
      });
      await expect.element(trigger).toBeVisible();
      const button = trigger.element() as HTMLElement;
      expect(ref.current).toBe(button);
      expect(getComputedStyle(button).display).toMatch(/^(inline-)?flex$/);
      const bounds = button.getBoundingClientRect();
      expect(bounds.height).toBe(40);
      if (width < 640) expect(bounds.width).toBe(40);
      // Every visible descendant stays vertically inside the trigger.
      for (const child of button.querySelectorAll("span, svg")) {
        const rect = child.getBoundingClientRect();
        if (!rect.height) continue;
        expect(rect.top).toBeGreaterThanOrEqual(bounds.top);
        expect(rect.bottom).toBeLessThanOrEqual(bounds.bottom);
      }
      await trigger.click();
      expect(onClick).toHaveBeenCalledOnce();
      await expect.element(page.getByRole("menu")).toBeVisible();
      await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
      if (mode === "function") {
        await expect
          .element(trigger)
          .toHaveAttribute("data-render-open", "true");
      }
      await page
        .getByRole("menuitem", { name: "Open profile: Alex Morgan" })
        .click();
      await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
      await expect.element(trigger).toHaveFocus();
    });
  }
}

test("custom trigger text uses its natural width on mobile", async () => {
  await page.viewport(375, 800);
  mount(menu({ children: "Account settings" }));
  const trigger = page.getByRole("button", { name: "Account: Alex Morgan" });
  await expect.element(trigger).toBeVisible();
  const button = trigger.element();
  expect(button.getBoundingClientRect().width).toBeGreaterThan(100);
  expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
  expect(button.getBoundingClientRect().height).toBe(40);
});

test("custom render preserves loading indicator and disabled behavior", async () => {
  mount(
    menu(
      {
        render: (props, state) => (
          <button {...props} data-render-disabled={state.disabled} />
        ),
      },
      true,
    ),
  );
  const trigger = page.getByRole("button", { name: "Account: Alex Morgan" });
  await expect.element(trigger).toBeDisabled();
  await expect.element(trigger).toHaveAttribute("aria-busy", "true");
  await expect.element(trigger).toHaveAttribute("data-render-disabled", "true");
  await expect.element(page.getByRole("status")).toBeVisible();
});

const goodImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='blue'/%3E%3C/svg%3E";
for (const kind of ["user", "workspace"] as const) {
  for (const asset of ["missing", "broken", "image", "icon"] as const) {
    test(`${kind} avatar handles ${asset} without blank or duplicate content`, async () => {
      const visual =
        asset === "missing" ? undefined : asset === "icon" ? (
          <svg data-testid="custom-icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="6" />
          </svg>
        ) : (
          <AvatarImage
            src={asset === "image" ? goodImage : "data:image/png;base64,broken"}
          />
        );
      const workspace = { id: "north", name: "North Studio", icon: visual };
      mount(
        <TopbarMenu
          currentWorkspace={kind === "workspace" ? workspace : undefined}
          user={
            kind === "user"
              ? { name: "Alex Morgan", avatar: visual }
              : undefined
          }
        >
          <TopbarMenuTrigger />
          <TopbarMenuContent>
            {kind === "user" ? (
              <TopbarMenuUser onClick={() => {}} />
            ) : (
              <TopbarMenuWorkspaceGroup value="north">
                <TopbarMenuWorkspaceItem workspace={workspace} />
              </TopbarMenuWorkspaceGroup>
            )}
          </TopbarMenuContent>
        </TopbarMenu>,
      );
      await page.getByRole("button").click();
      await expect.element(page.getByRole("menu")).toBeVisible();
      await expect
        .poll(() => {
          const avatars = document.querySelectorAll(
            `[data-slot="${kind === "user" ? "user-avatar" : "workspace-icon"}"]`,
          );
          expect(avatars.length).toBe(2);
          for (const avatar of avatars) {
            const fallback = avatar.querySelector<HTMLElement>(
              '[data-slot="avatar-fallback"]',
            );
            if (asset === "image") {
              expect(avatar.querySelector("img")?.naturalWidth).toBe(32);
              expect(fallback).toBeNull();
            } else if (asset === "icon") {
              expect(avatar.querySelector("svg")).not.toBeNull();
              expect(fallback && getComputedStyle(fallback).display).toBe(
                "none",
              );
            } else {
              expect(fallback?.textContent).toBe(kind === "user" ? "A" : "N");
              expect(fallback && getComputedStyle(fallback).display).toBe(
                "flex",
              );
            }
          }
          return true;
        })
        .toBe(true);
    });
  }
}

// Fixed header palettes must remain legible even when the page theme is opposite.
function pixel(color: string) {
  const context = document.createElement("canvas").getContext("2d")!;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  return Array.from(context.getImageData(0, 0, 1, 1).data);
}
for (const globalDark of [false, true]) {
  for (const variant of [undefined, "light", "dark"] as const) {
    test(`Topbar ${variant ?? "auto"} palette under ${globalDark ? "dark" : "light"} theme`, async () => {
      await page.viewport(1280, 800);
      document.documentElement.classList.toggle("dark", globalDark);
      mount(
        <Topbar variant={variant}>
          <TopbarAction aria-label="Notifications">!</TopbarAction>
          <TopbarMenu user={{ name: "Alex Morgan" }}>
            <TopbarMenuTrigger />
            <TopbarMenuContent>
              <TopbarMenuUser onClick={() => {}} />
            </TopbarMenuContent>
          </TopbarMenu>
        </Topbar>,
      );
      const dark = variant === "dark" || (variant === undefined && globalDark);
      const foreground = dark ? [250, 250, 250, 255] : [10, 10, 10, 255];
      const accent = dark ? [38, 38, 38, 255] : [245, 245, 245, 255];
      const accentForeground = dark ? [250, 250, 250, 255] : [23, 23, 23, 255];
      const headerBackground = dark ? [23, 23, 23, 255] : [255, 255, 255, 255];
      const header = container.querySelector("header")!;
      expect(pixel(getComputedStyle(header).backgroundColor)).toEqual(
        headerBackground,
      );
      expect(pixel(getComputedStyle(header).color)).toEqual(foreground);
      const action = page.getByRole("button", { name: "Notifications" });
      const trigger = page.getByRole("button", {
        name: "Account: Alex Morgan",
      });
      expect(pixel(getComputedStyle(action.element()).color)).toEqual(
        foreground,
      );
      expect(pixel(getComputedStyle(trigger.element()).color)).toEqual(
        foreground,
      );
      expect(
        pixel(getComputedStyle(trigger.element()).backgroundColor),
      ).toEqual(headerBackground);
      await action.hover();
      await expect
        .poll(() => pixel(getComputedStyle(action.element()).backgroundColor))
        .toEqual(accent);
      await trigger.click();
      await expect.element(page.getByRole("menu")).toBeVisible();
      await expect
        .poll(() => pixel(getComputedStyle(trigger.element()).backgroundColor))
        .toEqual(accent);
      expect(pixel(getComputedStyle(trigger.element()).color)).toEqual(
        accentForeground,
      );
      // The portaled popup remains in the page's theme, outside the header scope.
      expect(
        pixel(
          getComputedStyle(page.getByRole("menu").element()).backgroundColor,
        ),
      ).toEqual(globalDark ? [23, 23, 23, 255] : [255, 255, 255, 255]);
      expect(
        pixel(
          getComputedStyle(page.getByRole("menu").element()).getPropertyValue(
            "--background",
          ),
        ),
      ).toEqual(globalDark ? [10, 10, 10, 255] : [255, 255, 255, 255]);
    });
  }
}

test("automatic Topbar inherits custom application colors", async () => {
  mount(
    <div
      style={
        {
          "--background": "rgb(20 40 60)",
          "--sidebar": "rgb(40 60 80)",
          "--topbar": "rgb(30 50 70)",
          "--foreground": "rgb(240 230 220)",
          "--accent": "rgb(60 80 100)",
          "--accent-foreground": "rgb(250 250 250)",
        } as CSSProperties
      }
    >
      {menu()}
    </div>,
  );
  const header = container.querySelector("header")!;
  expect(pixel(getComputedStyle(header).backgroundColor)).toEqual([
    30, 50, 70, 255,
  ]);
  expect(pixel(getComputedStyle(header).color)).toEqual([240, 230, 220, 255]);
  const trigger = page.getByRole("button", { name: "Account: Alex Morgan" });
  expect(pixel(getComputedStyle(trigger.element()).backgroundColor)).toEqual([
    30, 50, 70, 255,
  ]);
  await trigger.hover();
  await expect
    .poll(() => pixel(getComputedStyle(trigger.element()).backgroundColor))
    .toEqual([60, 80, 100, 255]);
});

for (const styleMode of ["object", "callback"] as const) {
  test(`informational user forwards DOM props, events and ref with ${styleMode} styles`, async () => {
    const ref = createRef<HTMLDivElement>();
    const onMouseEnter = vi.fn();
    const style = { letterSpacing: "1px" };
    const getStyle = vi.fn(() => style);
    mount(
      <TopbarMenu user={{ name: "Alex Morgan", email: "alex@example.com" }}>
        <TopbarMenuTrigger />
        <TopbarMenuContent>
          <TopbarMenuUser
            ref={ref}
            disabled
            aria-label="Current account"
            closeOnClick={false}
            data-testid="informational-user"
            id="current-account"
            label="Account"
            nativeButton={false}
            style={styleMode === "callback" ? getStyle : style}
            title="Signed in as Alex"
            variant="destructive"
            onMouseEnter={onMouseEnter}
          />
        </TopbarMenuContent>
      </TopbarMenu>,
    );
    await page.getByRole("button", { name: "Account: Alex Morgan" }).click();
    const row = page.getByTestId("informational-user");
    await expect.element(row).toBeVisible();
    expect(ref.current).toBe(row.element());
    await expect.element(row).toHaveAttribute("id", "current-account");
    await expect.element(row).toHaveAttribute("aria-label", "Current account");
    await expect.element(row).toHaveAttribute("title", "Signed in as Alex");
    expect(getComputedStyle(row.element()).letterSpacing).toBe("1px");
    for (const attribute of [
      "disabled",
      "closeonclick",
      "label",
      "nativebutton",
      "variant",
    ]) {
      expect(row.element().hasAttribute(attribute)).toBe(false);
    }
    expect(row.element().getAttribute("data-slot")).toBe("dropdown-menu-label");
    expect(page.getByRole("menuitem").elements()).toHaveLength(0);
    await row.hover();
    expect(onMouseEnter).toHaveBeenCalled();
    if (styleMode === "callback") {
      expect(getStyle).toHaveBeenCalledWith({
        disabled: true,
        highlighted: false,
      });
    }
  });
}

for (const mode of ["action", "link"] as const) {
  test(`interactive user preserves custom accessible name and ref for ${mode}`, async () => {
    const ref = createRef<HTMLDivElement>();
    const onClick = vi.fn((event) => event.preventDefault());
    mount(
      <TopbarMenu user={{ name: "Alex Morgan" }}>
        <TopbarMenuTrigger />
        <TopbarMenuContent>
          <TopbarMenuUser
            ref={ref}
            aria-label="Manage my account"
            closeOnClick={false}
            data-testid="profile-user"
            render={mode === "link" ? <a href="/profile" /> : undefined}
            title="Profile"
            onClick={onClick}
          />
        </TopbarMenuContent>
      </TopbarMenu>,
    );
    await page.getByRole("button", { name: "Account: Alex Morgan" }).click();
    const row = page.getByRole("menuitem", { name: "Manage my account" });
    await expect.element(row).toBeVisible();
    expect(ref.current).toBe(row.element());
    await expect.element(row).toHaveAttribute("data-testid", "profile-user");
    await expect.element(row).toHaveAttribute("title", "Profile");
    if (mode === "link")
      await expect.element(row).toHaveAttribute("href", "/profile");
    await row.click();
    expect(onClick).toHaveBeenCalledOnce();
    await expect.element(page.getByRole("menu")).toBeVisible();
  });
}

test("navigation trigger works without props and hides on desktop", async () => {
  await page.viewport(375, 800);
  mount(
    <SidebarProvider>
      <Topbar>
        <TopbarSidebarTrigger />
      </Topbar>
    </SidebarProvider>,
  );
  const trigger = page.getByRole("button", { name: "Toggle navigation" });
  await expect.element(trigger).toBeVisible();
  const button = trigger.element();
  expect(button.tagName).toBe("BUTTON");
  expect(button.querySelector("button")).toBeNull();
  expect(button.querySelector("svg[aria-hidden=true]")).not.toBeNull();
  expect(button.getBoundingClientRect().width).toBe(40);
  expect(button.getBoundingClientRect().height).toBe(40);
  await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
  await userEvent.keyboard("{Enter}");
  await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  await page.viewport(1280, 800);
  await expect.element(button).not.toBeVisible();
});

test("navigation trigger forwards ref and render, and allows cancelling the toggle", async () => {
  await page.viewport(375, 800);
  const ref = createRef<HTMLButtonElement>();
  const onClick = vi.fn((event) => event.preventDefault());
  mount(
    <SidebarProvider>
      <Topbar>
        <TopbarSidebarTrigger
          ref={ref}
          aria-label="Open menu"
          render={<button data-testid="custom-navigation" />}
          onClick={onClick}
        />
      </Topbar>
    </SidebarProvider>,
  );
  const trigger = page.getByRole("button", { name: "Open menu" });
  expect(ref.current).toBe(trigger.element());
  await trigger.click();
  expect(onClick).toHaveBeenCalledOnce();
  await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  await expect
    .element(trigger)
    .toHaveAttribute("data-testid", "custom-navigation");
});

test("disabled navigation trigger does not open the sidebar", async () => {
  await page.viewport(375, 800);
  const onClick = vi.fn();
  mount(
    <SidebarProvider>
      <Topbar>
        <TopbarSidebarTrigger disabled onClick={onClick} />
      </Topbar>
    </SidebarProvider>,
  );
  const trigger = page.getByRole("button", { name: "Toggle navigation" });
  await expect.element(trigger).toBeDisabled();
  (trigger.element() as HTMLButtonElement).click();
  expect(onClick).not.toHaveBeenCalled();
  await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
});

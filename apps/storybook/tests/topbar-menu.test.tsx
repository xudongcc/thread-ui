import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { createRef } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import type { ReactNode } from "react";
import type { Root } from "react-dom/client";
import type { TopbarMenuTriggerProps } from "@/components/thread-ui/topbar";
import {
  Topbar,
  TopbarMenu,
  TopbarMenuContent,
  TopbarMenuTrigger,
  TopbarMenuUser,
  TopbarMenuWorkspaceGroup,
  TopbarMenuWorkspaceItem,
} from "@/components/thread-ui/topbar";
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

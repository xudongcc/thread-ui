import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { createRef } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import type { ReactNode } from "react";
import type { Root } from "react-dom/client";
import type { SidebarAccountMenuProps } from "@/components/thread-ui/sidebar-account-menu";
import {
  SidebarAccountMenu,
  SidebarAccountMenuItem,
} from "@/components/thread-ui/sidebar-account-menu";
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
function menu(render?: SidebarAccountMenuProps["render"], loading = false) {
  return (
    <div className="w-64">
      <SidebarAccountMenu
        loading={loading}
        render={render}
        user={{ name: "Alex Morgan", onClick: () => {} }}
      />
    </div>
  );
}

test.each([
  [undefined, 3],
  [1, 1],
  [5, 5],
  [0, 0],
  [-1, 0],
  [2.9, 2],
  [NaN, 3],
  [Infinity, 3],
])(
  "maxWorkspaces=%s limits the merged list to %s rows",
  async (limit, count) => {
    const first = { id: "first", name: "First" };
    const workspaces = Object.freeze([
      first,
      first,
      { id: "second", name: "Second" },
      { id: "third", name: "Third" },
      { id: "fourth", name: "Fourth" },
    ]);
    mount(
      <SidebarAccountMenu
        maxWorkspaces={limit}
        user={{ name: "Alex Morgan" }}
        workspace={{ id: "current", name: "Current" }}
        workspaces={workspaces}
      />,
    );
    const trigger = page.getByRole("button", {
      name: "Workspace and account: Current",
    });
    await trigger.click();
    await expect.element(page.getByRole("menu")).toBeVisible();
    const rows = page.getByRole("menuitemradio").elements();
    expect(rows.map((row) => row.getAttribute("aria-label"))).toEqual(
      ["Current", "First", "Second", "Third", "Fourth"].slice(0, count),
    );
    expect(workspaces).toHaveLength(5);
    expect(workspaces[0]).toBe(first);
    expect(workspaces[1]).toBe(first);
    if (count) {
      expect(rows[0]).toHaveAttribute("aria-checked", "true");
    } else {
      expect(page.getByText("Recent workspaces").elements()).toHaveLength(0);
      expect(page.getByRole("separator").elements()).toHaveLength(0);
      await expect.element(trigger).toHaveTextContent("Current");
      await expect.element(page.getByText("Alex Morgan")).toBeVisible();
    }
  },
);

for (const width of [375, 1280]) {
  for (const mode of ["element", "function"] as const) {
    test(`${mode} render keeps layout, menu state, events and ref at ${width}px`, async () => {
      await page.viewport(width, 800);
      const ref = createRef<HTMLButtonElement>();
      const onClick = vi.fn();
      const render: SidebarAccountMenuProps["render"] =
        mode === "element" ? (
          <button ref={ref} onClick={onClick} />
        ) : (
          (props, state) => (
            <button
              {...props}
              ref={ref}
              data-render-open={state.open}
              onClick={onClick}
            />
          )
        );
      mount(menu(render));
      const trigger = page.getByRole("button", {
        name: "Account: Alex Morgan",
      });
      await expect.element(trigger).toBeVisible();
      const button = trigger.element() as HTMLElement;
      expect(ref.current).toBe(button);
      expect(getComputedStyle(button).display).toMatch(/^(inline-)?flex$/);
      const bounds = button.getBoundingClientRect();
      expect(bounds.height).toBe(48);
      expect(bounds.width).toBe(256);
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

test("custom render preserves loading indicator and disabled behavior", async () => {
  mount(
    menu(
      (props, state) => (
        <button {...props} data-render-disabled={state.disabled} />
      ),
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
        <SidebarAccountMenu
          workspace={kind === "workspace" ? workspace : undefined}
          user={
            kind === "user"
              ? { name: "Alex Morgan", avatar: visual }
              : undefined
          }
        />,
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

for (const styleMode of ["object", "callback"] as const) {
  test(`informational user forwards DOM props, events and ref with ${styleMode} styles`, async () => {
    const ref = createRef<HTMLDivElement>();
    const onMouseEnter = vi.fn();
    const style = { letterSpacing: "1px" };
    const getStyle = vi.fn(() => style);
    mount(
      <SidebarAccountMenu
        user={{
          name: "Alex Morgan",
          email: "alex@example.com",
          ref,
          disabled: true,
          "aria-label": "Current account",
          closeOnClick: false,
          ...{ "data-testid": "informational-user" },
          id: "current-account",
          label: "Account",
          nativeButton: false,
          style: styleMode === "callback" ? getStyle : style,
          title: "Signed in as Alex",
          variant: "destructive",
          onMouseEnter,
        }}
      />,
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
      <SidebarAccountMenu
        user={{
          name: "Alex Morgan",
          ref,
          "aria-label": "Manage my account",
          closeOnClick: false,
          ...{ "data-testid": "profile-user" },
          render: mode === "link" ? <a href="/profile" /> : undefined,
          title: "Profile",
          onClick,
        }}
      />,
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

for (const scenario of ["user", "workspace", "actions"] as const) {
  test(`${scenario}-only props do not add stray separators`, async () => {
    mount(
      <SidebarAccountMenu
        user={scenario === "user" ? { name: "Alex Morgan" } : undefined}
        workspaces={[]}
        workspace={
          scenario === "workspace"
            ? { id: "north", name: "North Studio" }
            : undefined
        }
      >
        {scenario === "actions" ? (
          <SidebarAccountMenuItem>Help center</SidebarAccountMenuItem>
        ) : (
          [null, false]
        )}
      </SidebarAccountMenu>,
    );
    await page.getByRole("button").click();
    await expect.element(page.getByRole("menu")).toBeVisible();
    expect(page.getByRole("separator").elements()).toHaveLength(0);
    if (scenario !== "workspace") {
      expect(page.getByText("Recent workspaces").elements()).toHaveLength(0);
      expect(page.getByRole("menuitemradio").elements()).toHaveLength(0);
    }
  });
}

test("workspace props deduplicate, preserve links and wait for controlled selection", async () => {
  const north = { id: "north", name: "North Studio" };
  const market = { id: "market", name: "Night Market" };
  const onWorkspaceChange = vi.fn();
  const linkClick = vi.fn((event) => event.preventDefault());
  const view = (workspace = north) => (
    <SidebarAccountMenu
      user={{ name: "Alex Morgan" }}
      workspace={workspace}
      workspaces={[
        market,
        { ...north, render: <a href="#north" onClick={linkClick} /> },
        market,
        { id: "archive", name: "Archive", disabled: true },
      ]}
      onWorkspaceChange={onWorkspaceChange}
    >
      <SidebarAccountMenuItem>Help center</SidebarAccountMenuItem>
    </SidebarAccountMenu>
  );
  mount(view());
  await page.getByRole("button").click();
  await expect.element(page.getByRole("menu")).toBeVisible();
  const options = page.getByRole("menuitemradio").elements();
  expect(options).toHaveLength(3);
  expect(options[0]).toHaveAttribute("aria-label", north.name);
  await expect
    .element(page.getByRole("menuitemradio", { name: north.name }))
    .toHaveAttribute("href", "#north");
  await expect
    .element(page.getByRole("menuitemradio", { name: "Archive" }))
    .toHaveAttribute("aria-disabled", "true");
  expect(page.getByRole("separator").elements()).toHaveLength(2);
  await page.getByRole("menuitemradio", { name: market.name }).click();
  expect(onWorkspaceChange).toHaveBeenCalledWith(market.id, expect.anything());
  await expect
    .element(
      page.getByRole("button", { name: "Workspace and account: North Studio" }),
    )
    .toHaveAttribute("aria-expanded", "false");
  flushSync(() =>
    root!.render(<I18nextProvider i18n={i18n}>{view(market)}</I18nextProvider>),
  );
  await page
    .getByRole("button", { name: "Workspace and account: Night Market" })
    .click();
  await expect
    .element(page.getByRole("menuitemradio", { name: market.name }))
    .toHaveAttribute("aria-checked", "true");
});

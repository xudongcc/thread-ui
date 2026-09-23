import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Suspense, createRef, lazy } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import type { ComponentProps, ReactNode } from "react";
import type { Root } from "react-dom/client";
import type { BreadcrumbActionProps } from "@/components/thread-ui/page";
import {
  BreadcrumbAction,
  BreadcrumbActions,
  Page,
  PageActions,
  PageDescription,
  PageHeader,
  PagePrimaryAction,
  PageTitle,
} from "@/components/thread-ui/page";
import "../styles.css";

const i18n = createInstance();
beforeAll(async () => {
  await i18n.init({ lng: "en", resources: {} });
});
let root: Root | undefined;
let container: HTMLDivElement;
function mount(children: ReactNode) {
  if (!root) {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  }
  flushSync(() =>
    root!.render(<I18nextProvider i18n={i18n}>{children}</I18nextProvider>),
  );
}
afterEach(() => {
  if (root) flushSync(() => root!.unmount());
  root = undefined;
  container?.remove();
  document.documentElement.classList.remove("dark");
});

// Mirrors a framework Link that forwards attributes, events and its ref.
function Link({ to, ...props }: ComponentProps<"a"> & { to: string }) {
  return <a {...props} href={to} />;
}

for (const count of [1, 2]) {
  for (const mode of ["element", "function"] as const) {
    test(`${count} ancestors preserve ${mode} Link rendering, ref and events`, async () => {
      const ref = createRef<HTMLAnchorElement>();
      const onClick = vi.fn((event) => event.preventDefault());
      const render: BreadcrumbActionProps["render"] =
        mode === "element" ? (
          <Link to="/products" />
        ) : (
          (props, state) => (
            <Link {...props} data-disabled={state.disabled} to="/products" />
          )
        );
      mount(
        <BreadcrumbActions>
          <BreadcrumbAction ref={ref} render={render} onClick={onClick}>
            Products
          </BreadcrumbAction>
          {count === 2 && <BreadcrumbAction>Acme Widget</BreadcrumbAction>}
        </BreadcrumbActions>,
      );
      if (count === 2)
        await page.getByRole("button", { name: "Parent pages" }).click();
      const item = page.getByRole(count === 1 ? "link" : "menuitem", {
        name: "Products",
      });
      await expect.element(item).toHaveAttribute("href", "/products");
      expect(item.element().tagName).toBe("A");
      expect(ref.current).toBe(item.element());
      await item.click();
      expect(onClick).toHaveBeenCalledOnce();
      if (count === 2) {
        await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
        await expect
          .element(page.getByRole("button", { name: "Parent pages" }))
          .toHaveFocus();
      }
    });
  }
}

test("fragments and conditional items switch between menu, back button and no navigation", async () => {
  const onClick = vi.fn();
  const view = (count: number) => (
    <BreadcrumbActions>
      <>
        {count > 0 && (
          <BreadcrumbAction onClick={onClick}>Products</BreadcrumbAction>
        )}
        <>{count > 1 && <BreadcrumbAction>Acme Widget</BreadcrumbAction>}</>
      </>
    </BreadcrumbActions>
  );
  mount(view(2));
  await expect
    .element(page.getByRole("button", { name: "Parent pages" }))
    .toBeVisible();
  mount(view(1));
  await expect
    .element(page.getByRole("button", { name: "Parent pages" }))
    .not.toBeInTheDocument();
  await page.getByRole("button", { name: "Products" }).click();
  expect(onClick).toHaveBeenCalledOnce();
  mount(view(0));
  await expect.element(page.getByRole("navigation")).not.toBeInTheDocument();
});

test("ancestor menu supports keyboard selection, disabled items and Escape focus restoration", async () => {
  const onClick = vi.fn();
  const disabledClick = vi.fn();
  mount(
    <BreadcrumbActions menuLabel="Choose parent">
      <BreadcrumbAction onClick={onClick}>Products</BreadcrumbAction>
      <BreadcrumbAction disabled onClick={disabledClick}>
        Archived product
      </BreadcrumbAction>
      <BreadcrumbAction onClick={onClick}>Acme Widget</BreadcrumbAction>
    </BreadcrumbActions>,
  );
  const trigger = page.getByRole("button", { name: "Choose parent" });
  await trigger.click();
  await expect
    .element(page.getByRole("menuitem", { name: "Archived product" }))
    .toHaveAttribute("aria-disabled", "true");
  await userEvent.keyboard("{Escape}");
  await expect.element(trigger).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}");
  await expect
    .element(page.getByRole("menuitem", { name: "Products" }))
    .toHaveFocus();
  await userEvent.keyboard("{End}{Enter}");
  expect(onClick).toHaveBeenCalledOnce();
  expect(disabledClick).not.toHaveBeenCalled();
  await expect.element(trigger).toHaveFocus();
});

test("disabled single ancestor stays inactive and uses a non-submit button", async () => {
  const onSubmit = vi.fn((event) => event.preventDefault());
  const onClick = vi.fn();
  mount(
    <form onSubmit={onSubmit}>
      <BreadcrumbActions>
        <BreadcrumbAction disabled onClick={onClick}>
          Products
        </BreadcrumbAction>
      </BreadcrumbActions>
    </form>,
  );
  const trigger = page.getByRole("button", { name: "Products" });
  await expect.element(trigger).toBeDisabled();
  await expect.element(trigger).toHaveAttribute("type", "button");
  (trigger.element() as HTMLButtonElement).click();
  expect(onSubmit).not.toHaveBeenCalled();
  expect(onClick).not.toHaveBeenCalled();
});

for (const width of [320, 1024]) {
  test(`breadcrumb header fits at ${width}px with actions and long ancestor labels`, async () => {
    await page.viewport(width, 800);
    mount(
      <Page variant="full">
        <PageHeader>
          <BreadcrumbActions data-testid="ancestors">
            <BreadcrumbAction>Products</BreadcrumbAction>
            <BreadcrumbAction>
              {"A very long product name ".repeat(8)}
            </BreadcrumbAction>
          </BreadcrumbActions>
          <PageTitle>Edit product</PageTitle>
          <PageDescription>Manage product details.</PageDescription>
          <PageActions>
            <PagePrimaryAction>Save</PagePrimaryAction>
          </PageActions>
        </PageHeader>
      </Page>,
    );
    const nav = page.getByTestId("ancestors").element().getBoundingClientRect();
    const title = page
      .getByRole("heading", { name: "Edit product" })
      .element()
      .getBoundingClientRect();
    if (width === 320) expect(title.top).toBeGreaterThanOrEqual(nav.bottom);
    else {
      expect(title.left).toBeGreaterThanOrEqual(nav.right);
      expect(Math.abs(title.top - nav.top)).toBeLessThan(2);
    }
    await page.getByRole("button", { name: "Parent pages" }).click();
    const popup = page.getByRole("menu").element();
    const bounds = popup.getBoundingClientRect();
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(width);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    document.documentElement.classList.add("dark");
    await expect
      .element(page.getByRole("menuitem", { name: "Products" }))
      .toBeVisible();
  });
}

test("lazy action references are counted without relying on component identity", async () => {
  const LazyAction = lazy(async () => ({ default: BreadcrumbAction }));
  mount(
    <Suspense fallback="Loading ancestors">
      <BreadcrumbActions>
        <LazyAction>Products</LazyAction>
        <LazyAction>Acme Widget</LazyAction>
      </BreadcrumbActions>
    </Suspense>,
  );
  await page.getByRole("button", { name: "Parent pages" }).click();
  await expect
    .element(page.getByRole("menuitem", { name: "Products" }))
    .toBeVisible();
  await expect
    .element(page.getByRole("menuitem", { name: "Acme Widget" }))
    .toBeVisible();
});

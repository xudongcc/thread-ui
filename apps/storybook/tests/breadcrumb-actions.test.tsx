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
  PageSecondaryAction,
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
    expect(title.left).toBeGreaterThanOrEqual(nav.right);
    expect(
      Math.abs((title.top + title.bottom) / 2 - (nav.top + nav.bottom) / 2),
    ).toBeLessThan(2);
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

for (const width of [320, 1024]) {
  for (const ancestors of [0, 1, 2]) {
    for (const actions of [false, true]) {
      for (const description of [false, true]) {
        test(`page header at ${width}px: ${ancestors} ancestors, actions=${actions}, description=${description}`, async () => {
          await page.viewport(width, 800);
          const longTitle =
            "编辑商品：秋季限定系列 — " + "UnbrokenProductIdentifier".repeat(6);
          const longDescription =
            "Manage product details and availability. " +
            "UnbrokenDescription".repeat(12);
          mount(
            <Page variant="full">
              <PageHeader data-testid="header">
                <BreadcrumbActions>
                  {Array.from({ length: ancestors }, (_, index) => (
                    <BreadcrumbAction key={index}>
                      Parent {index + 1}
                    </BreadcrumbAction>
                  ))}
                </BreadcrumbActions>
                <PageTitle>{longTitle}</PageTitle>
                {description && (
                  <PageDescription data-testid="description">
                    {longDescription}
                  </PageDescription>
                )}
                {actions && (
                  <PageActions data-testid="actions">
                    <PagePrimaryAction>Save</PagePrimaryAction>
                    <PageSecondaryAction>Preview</PageSecondaryAction>
                  </PageActions>
                )}
              </PageHeader>
            </Page>,
          );
          const heading = page.getByRole("heading", { name: longTitle });
          await expect.element(heading).toBeVisible();
          const element = heading.element();
          const title = element.getBoundingClientRect();
          const header = page
            .getByTestId("header")
            .element()
            .getBoundingClientRect();
          expect(title.width).toBeGreaterThan(20);
          expect(element.scrollWidth).toBeGreaterThan(element.clientWidth);
          expect(getComputedStyle(element).textOverflow).toBe("ellipsis");
          expect(getComputedStyle(element).whiteSpace).toBe("nowrap");
          expect(getComputedStyle(element).fontSize).toBe(
            width === 320 ? "20px" : "24px",
          );
          if (ancestors === 0) expect(title.left).toBeCloseTo(header.left);
          else {
            const nav = page
              .getByRole("navigation")
              .element()
              .getBoundingClientRect();
            expect(title.left).toBeGreaterThanOrEqual(nav.right);
            expect(
              Math.abs(title.top + title.height / 2 - nav.top - nav.height / 2),
            ).toBeLessThan(2);
          }
          if (actions) {
            const buttons = page
              .getByTestId("actions")
              .element()
              .getBoundingClientRect();
            expect(title.right).toBeLessThanOrEqual(buttons.left);
            expect(buttons.right).toBeCloseTo(header.right);
            expect(
              Math.abs(
                title.top + title.height / 2 - buttons.top - buttons.height / 2,
              ),
            ).toBeLessThan(2);
            await expect
              .element(page.getByRole("button", { name: "Save" }))
              .toBeVisible();
          } else expect(title.right).toBeCloseTo(header.right);
          if (description) {
            const paragraph = page.getByTestId("description");
            await expect.element(paragraph).toBeVisible();
            const bounds = paragraph.element().getBoundingClientRect();
            expect(bounds.top).toBeGreaterThanOrEqual(title.bottom);
            expect(bounds.left).toBeCloseTo(header.left);
            expect(bounds.right).toBeCloseTo(header.right);
            expect(bounds.height).toBeGreaterThan(20);
          } else {
            expect(header.height).toBeCloseTo(
              Math.max(title.height, actions || ancestors ? 32 : 0) + 16,
            );
          }
          expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
            width,
          );
        });
      }
    }
  }
}

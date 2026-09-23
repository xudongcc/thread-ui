import { afterEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createRef } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import type { ReactNode } from "react";
import type { Root } from "react-dom/client";
import { FormLayout, FormLayoutItem } from "@/components/thread-ui/form-layout";
import { Input } from "@/components/thread-ui/input";
import "../styles.css";

let root: Root | undefined;
let container: HTMLDivElement;
function mount(children: ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  flushSync(() => root!.render(children));
}
afterEach(() => {
  if (root) flushSync(() => root!.unmount());
  root = undefined;
  container?.remove();
});
function bounds(id: string) {
  return page.getByTestId(id).element().getBoundingClientRect();
}

for (const [viewport, width] of [
  [1440, 511],
  [1440, 512],
  [1440, 767],
  [1440, 768],
  [375, 343],
]) {
  test(`field spans follow a ${width}px container at a ${viewport}px viewport`, async () => {
    await page.viewport(viewport, 900);
    mount(
      <div style={{ width }}>
        <FormLayout data-testid="layout">
          <FormLayoutItem data-testid="first" span="1/2">
            <Input label="First name" />
          </FormLayoutItem>
          <FormLayoutItem data-testid="last" span="1/2">
            <Input label="Last name" />
          </FormLayoutItem>
          <FormLayoutItem data-testid="street" span="2/3">
            <Input label="Street" />
          </FormLayoutItem>
          <FormLayoutItem data-testid="unit" span="1/3">
            <Input label="Unit" />
          </FormLayoutItem>
          <FormLayoutItem data-testid="city" span="1/3">
            <Input label="City" />
          </FormLayoutItem>
          <FormLayoutItem data-testid="state" span="1/3">
            <Input label="State" />
          </FormLayoutItem>
          <FormLayoutItem data-testid="zip" span="1/3">
            <Input label="Postal code" />
          </FormLayoutItem>
          <FormLayoutItem data-testid="email">
            <Input label="Email" />
          </FormLayoutItem>
        </FormLayout>
      </div>,
    );
    await expect.element(page.getByLabelText("First name")).toBeVisible();
    expect(bounds("email").width).toBeCloseTo(width, 0);
    if (width >= 512) {
      expect(bounds("first").y).toBe(bounds("last").y);
      expect(bounds("first").width).toBeCloseTo((width - 16) / 2, 0);
      expect(bounds("last").x - bounds("first").right).toBeCloseTo(16, 0);
    } else {
      expect(bounds("first").width).toBeCloseTo(width, 0);
      expect(bounds("last").y - bounds("first").bottom).toBeCloseTo(16, 0);
    }
    if (width >= 768) {
      expect(bounds("street").y).toBe(bounds("unit").y);
      expect(bounds("street").width).toBeCloseTo((2 * width - 16) / 3, 0);
      expect(bounds("unit").width).toBeCloseTo((width - 32) / 3, 0);
      expect(bounds("city").y).toBe(bounds("state").y);
      expect(bounds("city").y).toBe(bounds("zip").y);
    } else {
      for (const [previous, next] of [
        ["street", "unit"],
        ["city", "state"],
        ["state", "zip"],
      ]) {
        expect(bounds(next).y - bounds(previous).bottom).toBeCloseTo(16, 0);
        expect(bounds(next).width).toBeCloseTo(width, 0);
      }
    }
    expect(container.scrollWidth).toBeLessThanOrEqual(viewport);
  });
}

test("nested forms respond to their own container width", async () => {
  await page.viewport(1440, 900);
  mount(
    <div style={{ width: 960 }}>
      <FormLayout>
        <FormLayoutItem span="2/3">
          <Input label="Primary field" />
        </FormLayoutItem>
        <FormLayoutItem span="1/3">
          <FormLayout>
            <FormLayoutItem data-testid="nested-first" span="1/2">
              <Input label="Nested first" />
            </FormLayoutItem>
            <FormLayoutItem data-testid="nested-last" span="1/2">
              <Input label="Nested last" />
            </FormLayoutItem>
          </FormLayout>
        </FormLayoutItem>
      </FormLayout>
    </div>,
  );
  await expect.element(page.getByLabelText("Nested first")).toBeVisible();
  expect(bounds("nested-last").y - bounds("nested-first").bottom).toBeCloseTo(
    16,
    0,
  );
  expect(bounds("nested-first").width).toBeCloseTo((960 - 32) / 3, 0);
});

test("forwards native props and preserves label associations, focus order and form submission", async () => {
  await page.viewport(900, 900);
  const layoutRef = createRef<HTMLDivElement>();
  const itemRef = createRef<HTMLDivElement>();
  const onClick = vi.fn();
  const onFocus = vi.fn();
  const onSubmit = vi.fn();
  mount(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(Object.fromEntries(new FormData(event.currentTarget)));
      }}
    >
      <FormLayout
        ref={layoutRef}
        aria-label="Contact fields"
        data-testid="fields"
        id="contact-fields"
        onClick={onClick}
      >
        <FormLayoutItem
          ref={itemRef}
          data-testid="name-item"
          span="1/2"
          title="Name field"
          onFocus={onFocus}
        >
          <Input
            defaultValue="Alex"
            description="Your display name"
            label="Name"
            name="name"
          />
        </FormLayoutItem>
        <FormLayoutItem span="1/2">
          <Input
            defaultValue="alex@example.com"
            label="Email"
            name="email"
            type="email"
          />
        </FormLayoutItem>
      </FormLayout>
      <button type="submit">Save</button>
    </form>,
  );
  const name = page.getByRole("textbox", { name: "Name", exact: true });
  await expect.element(name).toBeVisible();
  expect(layoutRef.current).toBe(page.getByTestId("fields").element());
  expect(itemRef.current).toBe(page.getByTestId("name-item").element());
  await expect
    .element(page.getByTestId("fields"))
    .toHaveAttribute("id", "contact-fields");
  await expect
    .element(page.getByTestId("fields"))
    .toHaveAttribute("aria-label", "Contact fields");
  await expect
    .element(page.getByTestId("name-item"))
    .toHaveAttribute("title", "Name field");
  const descriptionId = name.element().getAttribute("aria-describedby");
  expect(document.getElementById(descriptionId!)?.textContent).toBe(
    "Your display name",
  );
  await name.click();
  expect(onClick).toHaveBeenCalled();
  expect(onFocus).toHaveBeenCalled();
  await userEvent.keyboard("{Tab}");
  await expect
    .element(page.getByRole("textbox", { name: "Email", exact: true }))
    .toHaveFocus();
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("new@example.com");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  expect(onSubmit).toHaveBeenCalledWith({
    name: "Alex",
    email: "new@example.com",
  });
  expect(container.querySelectorAll("form")).toHaveLength(1);
  expect(container.querySelectorAll('[data-slot="form-layout"] input')[0]).toBe(
    name.element(),
  );
});

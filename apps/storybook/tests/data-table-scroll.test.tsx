import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import en from "@repo/locales/en/thread-ui.json";
import type { Root } from "react-dom/client";
import {
  DataTable,
  createDataTableColumnHelper,
} from "@/components/thread-ui/data-table";
import "../styles.css";

const i18n = createInstance();
beforeAll(async () => {
  await i18n.init({ lng: "en", resources: { en: { "thread-ui": en } } });
});
const row = { id: "1", name: "Ada", email: "ada@example.com", role: "Admin" };
const columnHelper = createDataTableColumnHelper<typeof row>();
const columns = columnHelper.columns([
  columnHelper.column("name", { header: "Name", size: 100, pinned: "left" }),
  columnHelper.column("email", { header: "Email", size: 400 }),
  columnHelper.column("role", { header: "Role", size: 100, pinned: "right" }),
]);
let root: Root;
let container: HTMLDivElement;
afterEach(() => {
  if (root) flushSync(() => root.unmount());
  container?.remove();
});

test.each([false, true])(
  "horizontal scrolling preserves pinned columns and pagination (empty=%s)",
  async (empty) => {
    await page.viewport(375, 812);
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    flushSync(() =>
      root.render(
        <I18nextProvider i18n={i18n}>
          <DataTable
            bulkActions={<button type="button">Archive selected</button>}
            columns={columns}
            data={empty ? [] : [row]}
            pagination={{ hasPreviousPage: false, hasNextPage: false }}
            onRowSelectionChange={empty ? undefined : vi.fn()}
          />
        </I18nextProvider>,
      ),
    );
    const viewport = container.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )!;
    const tableContainer = container.querySelector<HTMLElement>(
      '[data-slot="table-container"]',
    )!;
    const headers = [
      ...container.querySelectorAll<HTMLTableCellElement>("thead th"),
    ];
    const left = headers.find((header) => header.textContent === "Name")!;
    const right = headers.find((header) => header.textContent === "Role")!;
    await expect.element(left).toBeVisible();
    const next = page.getByRole("button", { name: "Next page" }).element();
    await expect
      .poll(() => viewport.scrollWidth > viewport.clientWidth)
      .toBe(true);
    expect(getComputedStyle(tableContainer).overflowX).toBe("visible");
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(375);
    const positions = [left, right, next].map(
      (el) => el.getBoundingClientRect().x,
    );
    viewport.scrollLeft = 200;
    await expect.poll(() => viewport.scrollLeft).toBe(200);
    [left, right, next].forEach((el, index) => {
      expect(el.getBoundingClientRect().x).toBeCloseTo(positions[index], 0);
    });
    expect(viewport.contains(next)).toBe(false);
    expect(tableContainer.scrollLeft).toBe(0);
    await expect
      .poll(
        () =>
          container
            .querySelector<HTMLElement>(
              '[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]',
            )
            ?.getBoundingClientRect().width ?? 0,
      )
      .toBeGreaterThan(0);
    const scrollbar = container.querySelector<HTMLElement>(
      '[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]',
    )!;
    // Hit-testing catches pinned cells covering the track even when it is visible.
    const track = scrollbar.getBoundingClientRect();
    for (const x of [track.left + 5, track.right - 5]) {
      expect(
        scrollbar.contains(
          document.elementFromPoint(x, track.top + track.height / 2),
        ),
      ).toBe(true);
    }
    if (!empty) {
      await page
        .getByRole("checkbox", { name: "Select row", exact: true })
        .click();
      const action = page.getByRole("button", { name: "Archive selected" });
      await expect.element(action).toBeVisible();
      expect(viewport.contains(action.element())).toBe(false);
      expect(
        action.element().getBoundingClientRect().right,
      ).toBeLessThanOrEqual(375);
    }
  },
);

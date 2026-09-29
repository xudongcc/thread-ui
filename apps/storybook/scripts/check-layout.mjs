/* global console, document, getComputedStyle, URL */
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { preview } from "vite";

const app = fileURLToPath(new URL("../", import.meta.url));
const server = await preview({
  configFile: false,
  root: app,
  build: { outDir: "storybook-static" },
  preview: { host: "127.0.0.1", port: 0, open: false },
});
let browser;
try {
  browser = await chromium.launch();
  const url = `http://127.0.0.1:${server.httpServer.address().port}`;
  for (const [width, height, theme, locale] of [
    [1440, 960, "light", "en"],
    [768, 900, "light", "en"],
    [375, 812, "light", "en"],
    [320, 700, "light", "en"],
    [375, 812, "dark", "en"],
    [375, 812, "light", "zh"],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      hasTouch: width < 768,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const mobile = width < 768;
    const toggleLabel = "Toggle Sidebar";
    const switchLabel = (name) =>
      locale === "zh"
        ? `工作空间与账号：${name}`
        : `Workspace and account: ${name}`;
    await page.goto(
      `${url}/iframe.html?id=components-layout--default&viewMode=story&globals=theme:${theme};locale:${locale}`,
    );
    const main = page.getByRole("main");
    await main.waitFor();
    assert.equal(await page.locator("main").count(), 1, "Single main landmark");
    const viewport = main.locator('[data-slot="layout-content-viewport"]');
    const toggle = page.getByRole("button", { name: toggleLabel });
    if (mobile) {
      await toggle.waitFor();
      assert.equal(await page.getByRole("dialog").count(), 0);
    } else {
      assert.equal(
        await toggle.isVisible(),
        false,
        "Desktop hides the menu button",
      );
    }
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth),
      width,
      "No horizontal overflow",
    );
    assert.equal(await page.locator('[data-slot="topbar"]').count(), 0);
    if (!mobile) {
      const sidebar = await page
        .locator('[data-slot="sidebar-container"]')
        .boundingBox();
      const content = await main.boundingBox();
      assert.equal(sidebar.y, 0, "Sidebar starts at the top of the viewport");
      assert.equal(sidebar.height, height, "Sidebar spans the full height");
      assert.equal(
        sidebar.x + sidebar.width,
        content.x,
        "Content sits flush beside the sidebar",
      );
      assert.equal(content.y, 0, "Content has no outer top margin");
      assert.equal(content.height, height, "Content fills the viewport height");
      assert.equal(
        content.x + content.width,
        width,
        "Content reaches the right edge",
      );
      const footer = await page
        .locator('[data-slot="sidebar-footer"]')
        .boundingBox();
      assert.equal(
        Math.round(footer.y + footer.height),
        height,
        "Account menu stays at the bottom",
      );
    }
    if (mobile) {
      await page.waitForFunction(
        (dark) => document.documentElement.classList.contains("dark") === dark,
        theme === "dark",
      );
      const touch = await page.context().newCDPSession(page);
      const x = Math.round(width / 2);
      const startY = Math.round(height * 0.7);
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y: startY }],
      });
      for (const offset of [30, 70, 120, 180, 240]) {
        await touch.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x, y: startY - offset }],
        });
        await page.evaluate(
          () =>
            new Promise((resolve) =>
              document.defaultView.requestAnimationFrame(() =>
                document.defaultView.requestAnimationFrame(resolve),
              ),
            ),
        );
      }
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await page.waitForFunction(
        () =>
          document.querySelector('[data-slot="layout-content-viewport"]')
            .scrollTop > 0,
      );
      await touch.detach();
      assert(
        (await viewport.evaluate((element) => element.scrollTop)) > 0,
        "Mobile content scrolls independently with touch input",
      );
      assert.equal(
        await page.evaluate(() => document.scrollingElement.scrollTop),
        0,
        "The page itself does not scroll",
      );
      await viewport.evaluate((element) => {
        element.scrollTop = 0;
      });
    }

    if (mobile) await toggle.click();
    await page
      .getByRole("button", { name: switchLabel("North Studio") })
      .click();
    const menu = page.locator('[data-slot="dropdown-menu-content"]');
    await menu.waitFor();
    assert(await menu.getByText("Alex Morgan", { exact: true }).isVisible());
    assert(
      await menu.getByText("alex@example.com", { exact: true }).isVisible(),
    );
    const bounds = await menu.boundingBox();
    assert(
      bounds.x >= 0 && bounds.x + bounds.width <= width,
      "Workspace menu fits the viewport",
    );
    // Keyboard selection exercises the same flow as pointer/touch input.
    await page.getByRole("menuitemradio", { name: "Night Market" }).focus();
    await page.keyboard.press("Enter");
    await menu.waitFor({ state: "hidden" });
    const switched = page.getByRole("button", {
      name: switchLabel("Night Market"),
    });
    assert(
      await switched.evaluate((element) => element === document.activeElement),
      "Switching restores trigger focus",
    );
    assert((await page.locator("main").innerText()).includes("Night Market"));

    if (mobile) {
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      await toggle.click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await page.waitForFunction(() =>
        document
          .querySelector('[role="dialog"]')
          ?.contains(document.activeElement),
      );
      await page.keyboard.press("Shift+Tab");
      await page.waitForFunction(() =>
        document
          .querySelector('[role="dialog"]')
          ?.contains(document.activeElement),
      );
      assert(
        await dialog.evaluate((element) =>
          element.contains(document.activeElement),
        ),
        "Drawer traps keyboard focus",
      );
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      assert(
        await toggle.evaluate((element) => element === document.activeElement),
      );
      await toggle.click();
      await dialog.waitFor();
      await page.mouse.click(width - 2, height / 2);
      await dialog.waitFor({ state: "hidden" });
      await toggle.click();
      await dialog.waitFor();
      await page.getByRole("button", { name: "Orders", exact: true }).click();
      await dialog.waitFor({ state: "hidden" });
      await page.getByRole("heading", { name: "Orders", level: 1 }).waitFor();
      assert(
        await toggle.evaluate((element) => element === document.activeElement),
      );
      // A drawer should not reopen after switching from mobile to desktop and back.
      await toggle.click();
      await dialog.waitFor();
      await page.setViewportSize({ width: 1024, height });
      await dialog.waitFor({ state: "hidden" });
      await page.setViewportSize({ width, height });
      await toggle.waitFor();
      assert.equal(await page.getByRole("dialog").count(), 0);
    } else {
      await page.getByRole("button", { name: "Collapse navigation" }).click();
      const sidebar = page.locator('[data-slot="sidebar-container"]');
      assert(await sidebar.isVisible(), "Desktop navigation stays visible");
      assert.equal((await sidebar.boundingBox()).x, 0);
      assert.equal(
        await page.locator('[data-slot="sidebar"]').getAttribute("data-state"),
        "collapsed",
      );
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-slot="sidebar-container"]')
            .getBoundingClientRect().width === 48,
      );
      const account = page.getByRole("button", {
        name: switchLabel("Night Market"),
      });
      assert.equal(
        (await account.boundingBox()).width,
        32,
        "Collapsed account trigger remains inside the rail",
      );
      await page.mouse.move(width - 1, 1);
      const brand = page.locator(
        '[data-slot="sidebar-header"] svg[viewBox="0 0 32 32"]',
      );
      const expand = page.getByRole("button", { name: "Expand navigation" });
      assert(
        await brand.isVisible(),
        "Collapsed navigation shows its logo by default",
      );
      assert.equal(
        await expand.evaluate(
          (element) => getComputedStyle(element.parentElement).opacity,
        ),
        "0",
      );
      await page.screenshot({
        path: `/tmp/thread-ui-sidebar-collapsed-${width}.png`,
      });
      await expand.hover();
      assert.equal(
        await brand.isVisible(),
        false,
        "Hover replaces the logo with the navigation icon",
      );
      assert.equal(
        await expand.evaluate(
          (element) => getComputedStyle(element.parentElement).opacity,
        ),
        "1",
      );
      await page
        .locator('[data-slot="tooltip-content"]')
        .filter({ hasText: "Expand navigation" })
        .waitFor();
      await page.screenshot({
        path: `/tmp/thread-ui-sidebar-hover-${width}.png`,
      });
      await page.mouse.move(width - 1, 1);
      assert(await brand.isVisible(), "Leaving the header restores the logo");
      await expand.evaluate((element) => element.blur());
      await page.keyboard.press("Tab");
      await expand.focus();
      assert.equal(
        await expand.evaluate(
          (element) => getComputedStyle(element.parentElement).opacity,
        ),
        "1",
      );
      assert.equal(
        await brand.isVisible(),
        false,
        "Keyboard focus reveals the navigation icon",
      );
      await account.click();
      await menu.waitFor();
      await page.keyboard.press("Escape");
      await menu.waitFor({ state: "hidden" });
      await page.getByRole("button", { name: "Orders", exact: true }).click();
      await page.getByRole("heading", { name: "Orders", level: 1 }).waitFor();
      await expand.click();
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-slot="sidebar-container"]')
            .getBoundingClientRect().width === 256,
      );
    }
    const skipLink = page.getByRole("link", {
      name: locale === "zh" ? "跳转到主要内容" : "Skip to content",
    });
    await skipLink.focus();
    await page.keyboard.press("Enter");
    assert(
      await main.evaluate((element) => element === document.activeElement),
      "Skip link focuses main content",
    );
    // Preferences work inside the shared account menu, also on narrow screens.
    if (mobile) await toggle.click();
    await switched.click();
    await page
      .getByRole("menuitem", {
        name: locale === "zh" ? "主题" : "Theme",
        exact: true,
      })
      .click();
    const nextTheme = theme === "light" ? "dark" : "light";
    await page
      .getByRole("menuitemradio", {
        name:
          locale === "zh"
            ? nextTheme === "dark"
              ? "深色"
              : "浅色"
            : nextTheme === "dark"
              ? "Dark"
              : "Light",
        exact: true,
      })
      .click();
    await menu.waitFor({ state: "hidden" });
    assert.equal(
      await page.evaluate(() =>
        document.documentElement.classList.contains("dark"),
      ),
      nextTheme === "dark",
    );
    await switched.click();
    await page
      .getByRole("menuitem", {
        name: locale === "zh" ? "语言" : "Language",
        exact: true,
      })
      .click();
    await page
      .getByRole("menuitemradio", {
        name: locale === "zh" ? "English" : "中文",
        exact: true,
      })
      .waitFor();
    for (const popup of await page.getByRole("menu").all()) {
      const bounds = await popup.boundingBox();
      assert(
        bounds.x >= 0 && bounds.x + bounds.width <= width,
        "Preference submenu fits the viewport",
      );
    }
    await page
      .getByRole("menuitemradio", {
        name: locale === "zh" ? "English" : "中文",
        exact: true,
      })
      .click();
    await menu.waitFor({ state: "hidden" });
    await page
      .getByRole("button", {
        name:
          locale === "zh"
            ? "Workspace and account: Night Market"
            : "工作空间与账号：Night Market",
      })
      .waitFor();
    const accountTrigger = page.getByRole("button", {
      name:
        locale === "zh"
          ? "Workspace and account: Night Market"
          : "工作空间与账号：Night Market",
    });
    await accountTrigger.click();
    assert.equal(
      await page
        .getByRole("menuitem", { name: "Personal settings", exact: true })
        .count(),
      0,
    );
    await page
      .getByRole("menuitem", {
        name:
          locale === "zh"
            ? "Open profile: Alex Morgan"
            : "个人中心：Alex Morgan",
        exact: true,
      })
      .click();
    await menu.waitFor({ state: "hidden" });
    await main
      .getByRole("heading", {
        name: locale === "zh" ? "Profile" : "个人中心",
        exact: true,
      })
      .waitFor();
    assert(
      await main.getByText("alex@example.com", { exact: true }).isVisible(),
    );
    if (mobile)
      await page
        .getByRole("button", {
          name: "Toggle Sidebar",
        })
        .click();
    assert(
      await accountTrigger.isVisible(),
      "Opening profile preserves the workspace",
    );
    assert.deepEqual(errors, []);
    await page.screenshot({
      path: `/tmp/thread-ui-sidebar-layout-${width}-${theme}-${locale}.png`,
    });
    console.log(`Layout passed: ${width}×${height}, ${theme}, ${locale}`);
    await page.close();
  }
  for (const story of ["page-and-data-table", "split-page"]) {
    for (const width of [1440, 375, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(
        `${url}/iframe.html?id=components-layout--${story}&viewMode=story&embed=true`,
      );
      await page.getByRole("main").waitFor();
      await page.locator("[data-slot=page-title]").waitFor();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth),
        width,
      );
      assert(
        await page
          .getByRole("main")
          .evaluate((main) => main.scrollWidth <= main.clientWidth),
      );
      if (story === "page-and-data-table") {
        const search = page.getByLabel("Search orders", { exact: true });
        await search.fill("1001");
        await search.press("Enter");
        await page.getByText("#1001", { exact: true }).waitFor();
        assert(
          await page.getByRole("button", { name: "Next page" }).isDisabled(),
        );
        assert.equal(await page.getByText(/orders · Page/).count(), 0);
      } else {
        const sections = page.locator('[data-slot="page-layout-section"]');
        const left = await sections.nth(0).boundingBox();
        const right = await sections.nth(1).boundingBox();
        if (width === 1440) {
          assert(right.x > left.x + left.width, "Settings sit beside content");
          assert(Math.abs(right.y - left.y) < 1);
        } else {
          assert(
            right.y >= left.y + left.height,
            "Settings stack below content",
          );
        }
      }
      await page.screenshot({ path: `/tmp/thread-ui-${story}-${width}.png` });
      assert.deepEqual(errors, []);
      console.log(`Layout integration passed: ${story}, ${width}px`);
      await page.close();
    }
  }
  for (const width of [1440, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(
      `${url}/iframe.html?id=components-layout--without-sidebar&viewMode=story`,
    );
    const main = page.getByRole("main");
    await main.waitFor();
    assert.equal(
      (await main.boundingBox()).width,
      width,
      "Content fills the available width without Sidebar",
    );
    assert.equal(
      (await main.boundingBox()).height,
      900,
      "Content fills the available height",
    );
    console.log(`Layout optional parts passed: ${width}px`);
    await page.close();
  }
} finally {
  await browser?.close();
  await server.close();
}

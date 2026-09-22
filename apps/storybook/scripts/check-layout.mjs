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
    const toggleLabel = locale === "zh" ? "切换导航" : "Toggle navigation";
    const switchLabel = (name) =>
      locale === "zh"
        ? `工作空间与账号：${name}`
        : `Workspace and account: ${name}`;
    await page.goto(
      `${url}/iframe.html?id=components-layout--default&viewMode=story&globals=theme:${theme};locale:${locale}`,
    );
    const main = page.getByRole("main");
    await main.waitFor();
    const toggle = page.getByRole("button", { name: toggleLabel });
    if (mobile) {
      await toggle.waitFor();
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    } else {
      assert.equal(await toggle.count(), 0, "Desktop hides the menu button");
    }
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth),
      width,
      "No horizontal overflow",
    );
    const header = page.locator('[data-slot="topbar"]');
    assert.equal((await header.boundingBox()).y, 0);
    if (mobile) {
      await page.waitForFunction(
        (dark) => document.documentElement.classList.contains("dark") === dark,
        theme === "dark",
      );
      // Button transition-colors can still be running after the theme class changes.
      await page.waitForFunction(() => {
        const header = document.querySelector('[data-slot="topbar"]');
        const trigger = header?.querySelector('[data-sidebar="trigger"]');
        return (
          trigger &&
          getComputedStyle(trigger).color === getComputedStyle(header).color
        );
      });
      assert.equal(
        await toggle.evaluate((element) => getComputedStyle(element).color),
        await header.evaluate((element) => getComputedStyle(element).color),
        "Mobile navigation icon follows the header theme",
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
        () => document.querySelector("main").scrollTop > 0,
      );
      await touch.detach();
      assert(
        (await main.evaluate((element) => element.scrollTop)) > 0,
        "Mobile content scrolls independently with touch input",
      );
      assert.equal(
        await page.evaluate(() => document.scrollingElement.scrollTop),
        0,
        "The page itself does not scroll",
      );
      assert.equal((await header.boundingBox()).y, 0);
      await main.evaluate((element) => {
        element.scrollTop = 0;
      });
    }

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
    assert((await main.innerText()).includes("Night Market"));

    if (mobile) {
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
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-slot="sidebar-trigger"]')
            ?.getAttribute("aria-expanded") === "false",
      );
    } else {
      await page.keyboard.press("Control+b");
      const sidebar = page.locator('[data-slot="sidebar-container"]');
      assert(await sidebar.isVisible(), "Desktop navigation stays visible");
      assert.equal((await sidebar.boundingBox()).x, 0);
      assert.equal(
        await page.locator('[data-slot="sidebar"]').getAttribute("data-state"),
        "expanded",
        "Keyboard shortcuts cannot collapse desktop navigation",
      );
      await page.getByRole("button", { name: "Orders", exact: true }).click();
      await page.getByRole("heading", { name: "Orders", level: 1 }).waitFor();
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
    assert(
      await accountTrigger.isVisible(),
      "Opening profile preserves the workspace",
    );
    assert.deepEqual(errors, []);
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
} finally {
  await browser?.close();
  await server.close();
}

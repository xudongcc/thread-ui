/* global console, document, fetch, process, URL */
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import ts from "typescript";
import { preview } from "vite";

const app = fileURLToPath(new URL("../", import.meta.url));
process.chdir(app);
await mkdir("node_modules/.cache", { recursive: true });
const scratch = await mkdtemp(`${app}node_modules/.cache/story-sources-`);
let server;
let browser;

// Cover every variant of shared examples, plus the individual controlled and
// upload workflows. Basic stateless JSX snippets do not contain full modules.
function hasCompleteExample(id) {
  return (
    /^components-(calendar|dateinput|datepicker|datafilter|complexfilter|datatable|codeblock|alertdialog|toast|layout|topbar|topbarmenu)--/.test(
      id,
    ) ||
    /^components-page--(pagination|link-actions)$/.test(id) ||
    /^components-fileupload--(automatic-upload|manual-upload|retry-failure)$/.test(
      id,
    ) ||
    /^components-(input|textarea|numberinput|radiogroup|checkboxgroup|select)--(controlled|multiple)$/.test(
      id,
    )
  );
}

try {
  // Test the minified build: development alone cannot catch renamed JSX tags.
  server = await preview({
    configFile: false,
    root: app,
    build: { outDir: "storybook-static" },
    preview: { host: "127.0.0.1", port: 0, open: false },
  });
  const baseUrl = `http://127.0.0.1:${server.httpServer.address().port}`;
  const index = await (await fetch(`${baseUrl}/index.json`)).json();
  const stories = Object.values(index.entries).filter(
    (entry) => entry.type === "story" && hasCompleteExample(entry.id),
  );
  assert(stories.length > 0, "No complete example stories found in the build");

  browser = await chromium.launch();
  const page = await browser.newPage();
  const files = [];
  for (const { id } of stories) {
    await page.goto(`${baseUrl}/?path=/story/${id}`);
    await page
      .frameLocator("#storybook-preview-iframe")
      .locator("#storybook-root > *")
      .first()
      .waitFor();
    // Let interaction tests finish before a manager click takes keyboard focus.
    await page.waitForFunction(() => {
      const preview = document.querySelector(
        "#storybook-preview-iframe",
      )?.contentWindow;
      return (
        preview?.__STORYBOOK_PREVIEW__?.currentRender?.phase === "finished"
      );
    });
    await page.getByRole("tab", { name: "Code", exact: true }).click();
    await page.waitForFunction(() =>
      [...document.querySelectorAll("pre")].some((element) =>
        element.textContent.includes("export default function Example"),
      ),
    );
    const source = await page
      .locator("pre")
      .filter({
        hasText: "export default function Example",
      })
      .innerText();
    const file = `${scratch}/${id}.tsx`;
    await writeFile(file, source);
    files.push(file);
    console.log(`Captured ${id}`);
  }

  const config = ts.readConfigFile(`${app}tsconfig.json`, ts.sys.readFile);
  assert(!config.error, "Could not read Storybook tsconfig");
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, app);
  const program = ts.createProgram(files, { ...parsed.options, noEmit: true });
  const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
  if (diagnostics.length) {
    console.error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => app,
        getCanonicalFileName: (file) => file,
        getNewLine: () => "\n",
      }),
    );
  }
  assert.equal(
    diagnostics.length,
    0,
    "Copied Code panel examples must typecheck",
  );
  console.log(
    `Validated ${files.length} complete examples from the production Code panel.`,
  );
} finally {
  await browser?.close();
  await server?.close();
  await rm(scratch, { recursive: true, force: true });
}

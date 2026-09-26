# Thread UI Storybook

Run from the repository root with Node.js 24+ and pnpm 10.28.0:

```sh
pnpm install
pnpm storybook
```

Open http://localhost:6006. This app uses React + Vite and loads component source directly; no component build or Next.js server is required.

```sh
pnpm storybook:build
pnpm --filter @repo/storybook check-types
pnpm --filter @repo/storybook exec playwright install chromium
pnpm storybook:test
pnpm storybook:test:watch
pnpm --filter @repo/storybook test:sources
pnpm --filter @repo/storybook test:layout
```

The static site is written to `apps/storybook/storybook-static`. On a fresh Linux CI image, install browser system dependencies with `playwright install --with-deps chromium` instead.

## Adding components

Add `stories/<component>.stories.tsx`, importing components through `@/components/thread-ui/*`. Use `Meta` and `StoryObj` from `@storybook/react-vite`. All stories receive Autodocs, shared styles, and AppProvider (i18next, AlertDialog, and Toast). Add states such as loading, disabled, error, and empty as named exports. Add a `play` function using `storybook/test` for meaningful interaction checks.

Choose a title in the appropriate functional area: `Foundations`, `Actions`, `Forms`, `Data`, `Display`, `Feedback`, or `Layout` (for example, `Forms/Input`). The Introduction lists each area's components, and `.storybook/preview.tsx` defines sidebar order. Existing stories keep their original `components-*` IDs explicitly so saved story and docs links survive the navigation reorganization; preserve those IDs when moving components between areas.

Declare new workspace dependencies in this app's package.json when adding examples for more component packages. Vite derives runtime aliases from this app's tsconfig; the component packages retain their own third-party dependencies. React is deduplicated across workspace packages.

`vite.config.ts` prebundles dependencies that Vite discovers late through linked workspace packages. If a new component causes an "optimized dependencies changed" reload when first opened, add its dependency to `optimizeDeps.include` using `@repo/package > dependency`, then restart Storybook. Static build output is excluded from the development watcher so building the docs does not reload open previews.

Use the language toolbar to check English and Chinese in the same story; do not add separate language-specific stories. Calendar's Default and AppProvider's Feedback interaction checks follow the selected language. Language selection changes component translations; it does not translate arbitrary story args. Theme selection applies to the preview document, including portalled popups. The shared theme lives in `themes/default-theme/theme.css`; application-specific CSS stays in each app. Storybook uses system fonts; the docs app continues to load its web fonts.

The base components use shadcn's `base-rhea` style with the existing blue theme. `packages/shadcn-ui/components.json` points to the shared theme stylesheet so future CLI updates apply to both Storybook and the docs app.

## Documentation

Autodocs is enabled globally. Add narrative documentation as `stories/*.mdx`, and reuse stories in those pages. The Introduction page is the starting point for consolidating documentation here. Existing Fumadocs pages can be migrated incrementally.

When a component supports a Props API, keep the `Default` export first and give it the display name `Props API`. Render the public component with args directly whenever local state is unnecessary. Put supported alternatives in separate `Composition API` or `Function API` examples with usage descriptions. Keep export names stable (including existing `Compound` exports) so saved story URLs continue working. Components without a Props API label their first story with their actual API style. `API Usage` documents all supported modes with live examples; update it when adding an API. FileUpload ref/hook actions are instance actions, not a global function API.

Check the Code panel as well as the canvas. Render the public component directly for simple Props API stories so Controls update the displayed props. A helper rendered as JSX needs its implementation included; passing it as a render function alone loses hooks and turns handlers into placeholder functions in generated source.

The app's Turbo configuration includes external component, shadcn, theme, and locale sources in the build cache inputs. Keep those inputs in sync if additional source directories are introduced.

Stateful and function examples live in `stories/examples/*.tsx`. Import the same file normally for rendering and with `?raw` for `withExampleSource`; render it as JSX so the Code panel combines the real hooks/handlers with the current story args. Keep basic stateless stories rendering the public component directly. Use `functionSource` for named callback props and `withExampleParameters` for fixed typed fixtures such as filter definitions. Disable Controls for those fixed fixtures; other controls still update the invocation. Do not replace state setters or upload/action callbacks with placeholder functions in copied examples.

`test:sources` builds Storybook, serves it locally, reads the production Code panel for all complete examples, and typechecks the copied modules. This catches missing imports, placeholder callbacks, lost enum types, and minified component names that canvas interaction tests do not detect. Set a stable `displayName` on example components so their generated JSX keeps the same name in production.

For popup interactions, wait until the popup leaves the accessibility tree and focus returns to the trigger before finishing `play`. Base UI Select intentionally retains hidden DOM after closing, so do not require its hidden listbox to be removed.

`test:layout` checks the built application shell at desktop, tablet, and 320/375px widths, including light/dark themes and Chinese labels. It verifies navigation, drawer focus/dismissal, tenant switching, scrolling, and viewport overflow, plus orders filtering and the responsive two-column detail page.

## Coverage and conventions

All story canvases and Docs story previews use `var(--sidebar)` as their background, defined once in `styles.css`. The theme toolbar updates this token for light/dark mode; keep background colors out of individual story decorators.

Use the viewport toolbar to test responsive behavior on existing stories. Do not add separate mobile or narrow-container stories that only change available width. Keep stories for component props and behavior, such as Page width variants, PageLayout column spans, and DataTable pinned columns.

All 25 visual component packages have a dedicated story file. `components/common` contains only TypeScript helpers and is documented on the Introduction page. Each component has its primary states and composition examples; complex examples show their controlled output so changes can be inspected.

- Dates use fixed sample values where a selected date is needed.
- File uploads run a local, abortable simulation. No upload endpoint is required; selected file contents remain in the browser.
- Confirmation and toast docs use separate iframes so their global managers do not duplicate feedback across examples.
- English and Chinese preview providers use separate i18next instances to keep locale state isolated when switching languages.
- `stories/examples/upload-states.tsx` contains the self-contained queue-state fixture. Storybook does not import the docs app.

## Vitest integration

`@storybook/addon-vitest` is registered in `.storybook/main.ts`. `vitest.config.ts` uses `storybookTest` with the Playwright browser provider and headless Chromium. Storybook 10.6 automatically applies preview annotations, including styles, decorators, and locales; no duplicate `setProjectAnnotations` setup is needed.

Run the full suite with `pnpm storybook:test`, keep it running with `pnpm storybook:test:watch`, or run a focused file:

```sh
pnpm --filter @repo/storybook test stories/file-upload.stories.tsx
```

Opening a story keeps its initial state: browsing does not execute interactions.
Wrap every interaction with `testOnly` from `stories/utils/test-only.ts`:

```tsx
play: testOnly(async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getByRole("button", { name: "Save" }));
});
```

The Vite config defines `__STORYBOOK_TEST__` as false for browsing/builds, and
Vitest overrides it to true. The helper returns the original play function only
in the test runner, preserving assertions and failures. Do not remove play
functions to suppress autoplay, or add unwrapped play functions. Reusing a
wrapped story's `play` (e.g. `Default.play`) is supported. Stories that need an
open dialog/menu as their initial state should express that state in args or
rendering. Docs also explicitly disables `docs.story.autoplay`.

The Storybook sidebar's **Run tests** button runs component tests through the addon. A story without a `play` function checks rendering; add meaningful interaction assertions for behavior such as selection, confirmation, pagination, and retries. Tests are local and do not require a hosted visual-testing service.

## Accessibility testing

`@storybook/addon-a11y` runs axe checks automatically when opening a story. Select a named story (rather than its Docs page), then open the **Accessibility** panel to inspect violations, passes, and incomplete checks. The toolbar also provides vision simulations. Expand the sidebar test widget and enable **Accessibility** when running component tests in the UI.

The existing `pnpm storybook:test` command includes accessibility checks in Chromium. `.storybook/preview.tsx` sets `parameters.a11y.test: "error"`, so violations fail CLI/CI tests by default. The default whole-body scope includes portalled dialogs, menus, and notifications. No accessibility rules are disabled beyond the addon's defaults.

There are 15 stories still requiring accessibility fixes. Only those stories use `parameters.a11y.test: "todo"`, with a `TODO(a11y)` comment describing the issue. They still run checks and show warnings in the Storybook UI, but their accessibility findings do not fail CLI/CI tests or produce CLI warnings; their interaction assertions still fail normally. A green test run therefore does not mean these known issues are fixed.

| Component       | Stories awaiting accessibility fixes     | Findings                                             |
| --------------- | ---------------------------------------- | ---------------------------------------------------- |
| Badge           | Variants                                 | Destructive text contrast                            |
| CodeBlock       | Default, Notation                        | Filename contrast and language icon alternative text |
| CodeBlock       | LanguageSelector                         | Selected language contrast                           |
| DataTable       | RowActions                               | Empty actions column header                          |
| DataTable       | PinnedColumns                            | Keyboard access to the scrollable region             |
| DateInput       | Default, Error                           | Placeholder contrast                                 |
| FileUpload      | States                                   | Failed upload status contrast                        |
| Input, Textarea | Error                                    | Error text contrast                                  |
| Select          | Default, Error, EmptyOptions, Controlled | Placeholder contrast                                 |

Fix the component and remove its story-level `todo` to restore strict checking. Keep new stories on the global `error` setting. See the [Storybook accessibility testing guide](https://storybook.js.org/docs/writing-tests/accessibility-testing/) for rule configuration and test behavior.

## Visual tests with Chromatic

`@chromatic-com/storybook` adds the **Visual Tests** panel. Start `pnpm storybook`, open a named story, and select **Visual Tests** to sign in to Chromatic and choose or create a project. Project linking adds the real `projectId` to this app's `chromatic.config.json`; the repository does not contain a placeholder project ID or project token.

`apps/storybook/chromatic.config.json` sets `buildScriptName: "build"` because this workspace app uses `pnpm build` to build Storybook. Keep the Chromatic configuration in this app's directory when linking the project.

Once connected, run visual tests from the Storybook testing widget and review changes in the **Visual Tests** panel. These runs upload the built stories to Chromatic for cloud snapshots. The local `pnpm storybook:test` command continues to run Vitest component and accessibility checks; it does not run Chromatic visual tests.

See the [Chromatic addon setup guide](https://www.chromatic.com/docs/visual-tests-addon/) for authentication and baseline review.

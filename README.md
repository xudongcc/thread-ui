# Thread UI

## Component development

```sh
pnpm install
pnpm storybook
```

Storybook runs at http://localhost:6006 with component examples, Controls, generated API docs, theme switching, and English/Chinese component translations.

See [the Storybook guide](apps/storybook/README.md) for adding stories, browser tests, and static builds.

## Hooks and libraries

Reusable hooks live in `hooks/<name>/` and non-React utilities in `libs/<name>/`.
Each directory has a package manifest and implementation named `<name>.ts`.
The registry discovers both groups alongside components and installs them as
`registry:hook` / `registry:lib`, respecting the consumer's `hooks` / `lib` aliases.
Names must be unique across groups. Keep tests and fixtures under `__tests__/`
so they are excluded from registry payloads.

```sh
pnpm --filter @repo/use-resource-navigation test
pnpm --filter @repo/connection-search test
pnpm --filter @repo/use-resource-navigation check-types
pnpm --filter @repo/connection-search check-types
node --test apps/docs/lib/__tests__/*.test.mjs
```

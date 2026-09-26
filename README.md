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
pnpm --filter @repo/graphql-connection test
pnpm --filter @repo/use-resource-navigation check-types
pnpm --filter @repo/graphql-connection check-types
node --test apps/docs/lib/__tests__/*.test.mjs
```

## Themes

Themes live in `themes/<name>/` alongside components, hooks, and libraries.
The registry discovers each theme package and converts its CSS into a
`registry:theme` item with `cssVars` and `css`. Names must be unique across all
registry groups.

The default theme's single source is `themes/default-theme/default.css`.
Docs and Storybook import it through the internal `@repo/default-theme`
workspace package. Consumers install it with:

```sh
pnpm dlx shadcn@latest add @thread-ui/default-theme
```

This merges the theme into the CSS file configured in `components.json`;
consumers do not need a workspace package or an extra CSS import. The former
`@thread-ui/theme` entry has been removed.

import { promises as fs } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";

import postcss from "postcss";
import postcssNested from "postcss-nested";
import type { ChildNode } from "postcss";
import type { RegistryItem } from "shadcn/schema";

const devDependencyBlocklist = new Set([
  "react-dom",
  "@types/react",
  "@types/react-dom",
  "typescript",
  "@testing-library/react",
  "@testing-library/user-event",
  "@vitejs/plugin-react",
  "jsdom",
  "vitest",
]);

const getPackageFiles = async (dir: string): Promise<Array<string>> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: Array<string> = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === "node_modules" || entry.name === "__tests__") {
      continue;
    }

    const entryPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getPackageFiles(entryPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
};

type RegistryCss = NonNullable<RegistryItem["css"]>;

const toRegistryCss = (nodes: ChildNode[]): RegistryCss => {
  const css: RegistryCss = {};
  for (const node of nodes) {
    if (node.type === "decl") {
      css[node.prop] = `${node.value}${node.important ? " !important" : ""}`;
    } else if (node.type === "rule") {
      css[node.selector] = toRegistryCss(node.nodes);
    } else if (node.type === "atrule") {
      const key = `@${node.name}${node.params ? ` ${node.params}` : ""}`;
      css[key] = node.nodes ? toRegistryCss(node.nodes) : {};
    }
  }
  return css;
};

const getThemePackage = async (
  packageName: string,
  packageDir: string,
  metadata: { title?: string; description?: string },
): Promise<RegistryItem> => {
  const theme = postcss.parse(
    await readFile(join(packageDir, "theme.css"), "utf-8"),
  );
  const cssVars = { theme: {}, light: {}, dark: {} } as {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  const css: RegistryCss = {};

  for (const node of theme.nodes) {
    if (node.type === "atrule" && node.name === "theme") {
      node.walkDecls((decl) => {
        // The applications supply these font families (Next/font or Fontsource).
        // Keep the consuming project's fonts instead of exporting dangling refs.
        if (["--font-sans", "--font-mono"].includes(decl.prop)) return;
        cssVars.theme[decl.prop.slice(2)] = decl.value;
      });
    } else if (node.type === "rule") {
      for (const selector of node.selectors) {
        if (selector === ":root" || selector === ".dark") {
          const values = selector === ":root" ? cssVars.light : cssVars.dark;
          node.walkDecls((decl) => {
            if (decl.prop.startsWith("--")) {
              values[decl.prop.slice(2)] = decl.value;
            }
          });
        } else {
          css[selector] = toRegistryCss(node.nodes);
        }
      }
    } else {
      Object.assign(css, toRegistryCss([node]));
    }
  }

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: packageName,
    type: "registry:theme",
    title: metadata.title ?? packageName,
    description: metadata.description,
    dependencies: [],
    devDependencies: [],
    registryDependencies: [],
    cssVars,
    css,
  };
};

// Keep each filesystem root explicit so Next.js traces only registry sources.
const getPackageGroups = () =>
  [
    {
      directory: (name: string) =>
        join(process.cwd(), "../../components", name),
      entries: () =>
        fs.readdir(join(process.cwd(), "../../components"), {
          withFileTypes: true,
        }),
      type: "registry:ui",
    },
    {
      directory: (name: string) => join(process.cwd(), "../../hooks", name),
      entries: () =>
        fs.readdir(join(process.cwd(), "../../hooks"), { withFileTypes: true }),
      type: "registry:hook",
    },
    {
      directory: (name: string) => join(process.cwd(), "../../libs", name),
      entries: () =>
        fs.readdir(join(process.cwd(), "../../libs"), { withFileTypes: true }),
      type: "registry:lib",
    },
    {
      directory: (name: string) => join(process.cwd(), "../../themes", name),
      entries: () =>
        fs.readdir(join(process.cwd(), "../../themes"), {
          withFileTypes: true,
        }),
      type: "registry:theme",
    },
  ] as const;

type PackageType = ReturnType<typeof getPackageGroups>[number]["type"];

export interface RegistryCatalogItem {
  name: string;
  type: PackageType;
  title: string;
  description?: string;
}

/** The catalog and item resolver share one public package namespace. */
const getPackageEntries = async () => {
  const packages = new Map<string, { directory: string; type: PackageType }>();
  for (const { directory, type, entries: readEntries } of getPackageGroups()) {
    const entries = await readEntries();
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (packages.has(entry.name)) {
        throw new Error(`Duplicate registry package: ${entry.name}`);
      }
      packages.set(entry.name, {
        directory: directory(entry.name),
        type,
      });
    }
  }
  return [...packages.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "en"))
    .map(([name, metadata]) => ({ name, ...metadata }));
};

export const getPackageNames = async () =>
  (await getPackageEntries()).map(({ name }) => name);

/** Search only reads manifests; full source and CSS are loaded on installation. */
export const getPackageCatalog = async (): Promise<RegistryCatalogItem[]> =>
  Promise.all(
    (await getPackageEntries()).map(async ({ name, directory, type }) => {
      const manifest = JSON.parse(
        await readFile(join(directory, "package.json"), "utf-8"),
      ) as { title?: string; description?: string };
      return {
        name,
        type,
        title: manifest.title ?? name,
        description: manifest.description,
      };
    }),
  );

export const getPackage = async (packageName: string) => {
  const isLocalesPackage = packageName === "locales";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(packageName)) {
    throw new Error("Invalid registry package name");
  }
  let packageType: PackageType = "registry:ui";
  let packageDir = join(process.cwd(), "../../locales");
  if (!isLocalesPackage) {
    let found = false;
    for (const group of getPackageGroups()) {
      const candidate = group.directory(packageName);
      const manifest = await fs
        .stat(join(candidate, "package.json"))
        .catch(() => null);
      if (!manifest?.isFile()) continue;
      if (found) throw new Error(`Duplicate registry package: ${packageName}`);
      found = true;
      packageDir = candidate;
      packageType = group.type;
    }
    if (!found) throw new Error(`Unknown registry package: ${packageName}`);
  }
  const packagePath = join(packageDir, "package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf-8"));
  if (packageType === "registry:theme") {
    return getThemePackage(packageName, packageDir, packageJson);
  }
  const packageDependencies = (packageJson.dependencies || {}) as Record<
    string,
    string
  >;
  const packageDevDependencies = (packageJson.devDependencies || {}) as Record<
    string,
    string
  >;
  const toDependencySpecifier = (
    dependency: string,
    version: string | undefined,
  ) => (version ? `${dependency}@${version}` : dependency);

  const repoDependencies = Object.keys(packageDependencies).filter(
    (dep) => dep.startsWith("@repo") && dep !== "@repo/shadcn-ui",
  );

  const dependencies = Object.keys(packageDependencies)
    .filter(
      (dep) =>
        ![
          "react",
          "react-dom",
          "@repo/shadcn-ui",
          ...repoDependencies,
        ].includes(dep),
    )
    .map((dep) => toDependencySpecifier(dep, packageDependencies[dep]));

  const devDependencies = Object.keys(packageDevDependencies)
    .filter(
      (dep) => !dep.startsWith("@repo/") && !devDependencyBlocklist.has(dep),
    )
    .map((dep) => toDependencySpecifier(dep, packageDevDependencies[dep]));

  const packageFiles = await getPackageFiles(packageDir);
  const sourceFiles = packageFiles.filter((file) => {
    const fileName = relative(packageDir, file);

    if (isLocalesPackage && fileName === "package.json") {
      return false;
    }

    if (
      !isLocalesPackage &&
      ["package.json", "tsconfig.json"].includes(fileName)
    ) {
      return false;
    }

    return (
      file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".json")
    );
  });
  const cssFiles = packageFiles.filter((file) => file.endsWith(".css"));

  const files: RegistryItem["files"] = [];

  for (const filePath of sourceFiles) {
    const fileName = relative(packageDir, filePath);
    const content = await fs.readFile(filePath, "utf-8");
    const isLocaleResource =
      fileName.endsWith(".json") &&
      (isLocalesPackage || fileName.startsWith("locales/"));
    const localeTarget = isLocalesPackage
      ? `~/public/locales/${fileName}`
      : `~/public/${fileName}`;

    files.push({
      type: isLocaleResource ? "registry:file" : packageType,
      path: fileName,
      content,
      target: isLocaleResource
        ? localeTarget
        : packageType === "registry:hook"
          ? `@hooks/${fileName}`
          : packageType === "registry:lib"
            ? `@lib/${fileName}`
            : `components/thread-ui/${packageName}/${fileName}`,
    });
  }

  const registryDependencies =
    files
      .map((f) => f.content)
      .join("\n")
      .match(/@\/components\/ui\/([a-z-]+)/g)
      ?.map((path) => path.split("/").pop())
      .filter((name): name is string => !!name) || [];

  for (const dep of repoDependencies) {
    const pkg = dep.replace("@repo/", "");

    registryDependencies.push(`https://thread-ui.vercel.app/r/${pkg}.json`);
  }

  const css: RegistryItem["css"] = {};

  for (const filePath of cssFiles) {
    const contents = await fs.readFile(filePath, "utf-8");

    // Process CSS with PostCSS to handle nested selectors
    const processed = await postcss([postcssNested]).process(contents, {
      from: undefined,
    });

    // Parse the processed CSS and convert to JSON structure
    const ast = postcss.parse(processed.css);

    ast.walkAtRules("layer", (atRule) => {
      const layerName = `@layer ${atRule.params}`;
      css[layerName] = {};

      // First pass: process non-media rules
      atRule.walkRules((rule) => {
        // Skip rules that are inside media queries
        if (
          rule.parent &&
          rule.parent.type === "atrule" &&
          "name" in rule.parent &&
          rule.parent.name === "media"
        ) {
          return;
        }

        const selector = rule.selector;
        const ruleObj: Record<string, string> = {};

        // Process all declarations
        rule.walkDecls((decl) => {
          ruleObj[decl.prop] = decl.value;
        });

        if (Object.keys(ruleObj).length > 0) {
          css[layerName][selector] = ruleObj;
        }
      });

      // Second pass: process media query rules as top-level entries
      atRule.walkAtRules("media", (mediaRule) => {
        const mediaQuery = `@media ${mediaRule.params}`;

        // Create a top-level media query entry if it doesn't exist
        if (!css[layerName][mediaQuery]) {
          css[layerName][mediaQuery] = {};
        }

        mediaRule.walkRules((rule) => {
          const selector = rule.selector;
          const mediaObj: Record<string, string> = {};

          rule.walkDecls((decl) => {
            mediaObj[decl.prop] = decl.value;
          });

          if (Object.keys(mediaObj).length > 0) {
            // Store the selector inside the media query
            css[layerName][mediaQuery][selector] = mediaObj;
          }
        });
      });
    });
  }

  // Export local appearance scopes from the same theme used by the preview.
  // Keep the existing variable names and leave the consumer's global theme intact.
  const theme = postcss.parse(
    await fs.readFile(
      join(process.cwd(), "../../themes/default-theme/theme.css"),
      "utf-8",
    ),
  );
  theme.walkRules((rule) => {
    const selectors = rule.selectors.filter((selector) =>
      selector.startsWith(`[data-slot="${packageName}"]`),
    );
    if (!selectors.length) return;
    const declarations: Record<string, string> = {};
    rule.walkDecls((decl) => {
      declarations[decl.prop] = decl.value;
    });
    css[selectors.join(", ")] = declarations;
  });

  let type: RegistryItem["type"] = isLocalesPackage
    ? "registry:item"
    : packageType;

  if (!Object.keys(files).length && Object.keys(css).length) {
    type = "registry:style";
  }

  // Standalone Topbar installs its own background token without replacing the
  // consuming application's general palette with the full Thread UI theme.
  let cssVars: RegistryItem["cssVars"];
  if (packageName === "topbar") {
    cssVars = { theme: {}, light: {}, dark: {} };
    theme.walkAtRules("theme", (rule) => {
      rule.walkDecls("--color-topbar", (decl) => {
        cssVars!.theme!["color-topbar"] = decl.value;
      });
    });
    theme.walkRules((rule) => {
      const mode = rule.selectors.includes(":root")
        ? "light"
        : rule.selectors.includes(".dark")
          ? "dark"
          : undefined;
      if (!mode) return;
      rule.walkDecls("--topbar", (decl) => {
        cssVars![mode]!.topbar = decl.value;
      });
    });
  }

  const response: RegistryItem = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: packageName,
    type,
    title: packageName,
    description: packageJson.description,
    dependencies,
    devDependencies,
    registryDependencies,
    files,
    css,
    ...(cssVars ? { cssVars } : {}),
  };

  return response;
};

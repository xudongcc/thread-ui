/** Inline explicitly supplied example modules so copied snippets stand alone. */
function inlineExampleSources(
  implementation: string,
  dependencies: Record<string, string>,
) {
  // Dependencies are supplied in initialization order (fixtures before examples).
  const sources = [...Object.values(dependencies), implementation].join("\n\n");
  const imports = new Map<string, Set<string>>();
  const body = sources.replace(
    /^import\s+(type\s+)?\{([^}]+)\}\s+from\s+["']([^"']+)["'];?\s*/gm,
    (_statement, type: string | undefined, names: string, module: string) => {
      if (Object.hasOwn(dependencies, module)) return "";
      const key = `${type ? "type " : ""}{IMPORTS} from "${module}"`;
      const specifiers = imports.get(key) ?? new Set<string>();
      for (const name of names.split(",")) {
        if (name.trim()) specifiers.add(name.trim().replace(/\s+/g, " "));
      }
      imports.set(key, specifiers);
      return "";
    },
  );
  return [
    ...[...imports].map(
      ([key, names]) =>
        `import ${key.replace("{IMPORTS}", `{ ${[...names].join(", ")} }`)};`,
    ),
    body.trim(),
  ].join("\n\n");
}

/** Keep hooks and handlers from the rendered example alongside its live args. */
export function withExampleSource(
  implementation: string,
  dependencies: Record<string, string> = {},
) {
  const source = Object.keys(dependencies).length
    ? inlineExampleSources(implementation, dependencies)
    : implementation.trim();
  return {
    type: "dynamic" as const,
    language: "tsx",
    transform: (invocation: string) =>
      `${source}\n\nexport default function Example() {\n  return (\n${invocation
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n")}\n  );\n}\n`,
  };
}

/** Refer to handlers defined in the raw example instead of printing no-op functions. */
export function functionSource(references: Record<string, unknown>) {
  const names = new Map(
    Object.entries(references).map(([name, value]) => [value, name]),
  );
  return (value: unknown) => names.get(value) ?? "() => {}";
}

/** Preserve typed constants (including enums/render functions) in example props. */
export function withExampleParameters(
  implementation: string,
  references: Record<string, unknown>,
  referenceProps: string[],
  dependencies: Record<string, string> = {},
) {
  const names = new Map(
    Object.entries(references).map(([name, value]) => [value, name]),
  );
  const source = withExampleSource(implementation, dependencies);
  return {
    jsx: {
      // Storybook clones prop objects before serialization; filter by prop name.
      filterProps: (value: unknown, key: string) =>
        value !== undefined && !referenceProps.includes(key),
    },
    docs: {
      source: {
        ...source,
        transform: (
          invocation: string,
          context: { args: Record<string, unknown> },
        ) => {
          const props = Object.entries(context.args)
            .filter(([, value]) => names.has(value))
            .map(([key, value]) => ` ${key}={${names.get(value)}}`)
            .join("");
          return source.transform(
            invocation.replace(/^(<[\w.]+)/, `$1${props}`),
          );
        },
      },
    },
  };
}

/** Keep hooks and handlers from the rendered example alongside its live args. */
export function withExampleSource(implementation: string) {
  return {
    type: "dynamic" as const,
    language: "tsx",
    transform: (invocation: string) =>
      `${implementation.trim()}\n\nexport default function Example() {\n  return (\n${invocation
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
) {
  const names = new Map(
    Object.entries(references).map(([name, value]) => [value, name]),
  );
  const source = withExampleSource(implementation);
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

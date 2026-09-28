/// <reference types="node" />
// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, parse } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, it } from "vitest";

it("emits reusable helpers and columns that preserve inference for consumers", () => {
  const componentRoot = fileURLToPath(new URL("..", import.meta.url));
  const directory = mkdtempSync(join(tmpdir(), "data-table-declarations-"));
  try {
    const config = ts.readConfigFile(
      join(componentRoot, "tsconfig.json"),
      ts.sys.readFile,
    );
    expect(config.error).toBeUndefined();
    const parsed = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      componentRoot,
    );
    const entry = join(directory, "columns.tsx");
    const publicEntry = JSON.stringify(join(componentRoot, "index"));
    writeFileSync(
      entry,
      `
      import { createDataTableColumnHelper } from ${publicEntry};
      export interface User { name: string }
      export const userColumnHelper = createDataTableColumnHelper<User>();
      export const { field, getValue, columns } = userColumnHelper;
      export const nameColumn = field("name", { header: "Name" });
      export const resizedNameColumn = { ...nameColumn, size: 180 };
      export const lengthColumn = getValue(row => row.name.length, { id: "length" });
    `,
    );
    const options: ts.CompilerOptions = {
      ...parsed.options,
      noEmit: false,
      emitDeclarationOnly: true,
      rootDir: parse(directory).root,
      outDir: join(directory, "dist"),
    };
    const program = ts.createProgram([entry], options);
    let declaration: string | undefined;
    const emit = program.emit(undefined, (path, contents) => {
      ts.sys.writeFile(path, contents);
      if (path.endsWith("/columns.d.ts")) declaration = path;
    });
    const messages = (diagnostics: readonly ts.Diagnostic[]) =>
      diagnostics.map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      );
    expect(
      messages([...ts.getPreEmitDiagnostics(program), ...emit.diagnostics]),
    ).toEqual([]);
    expect(emit.emitSkipped).toBe(false);
    expect(declaration).toBeDefined();

    const consumer = join(directory, "consumer.tsx");
    writeFileSync(
      consumer,
      `
      import { userColumnHelper, field, columns, resizedNameColumn, lengthColumn }
        from ${JSON.stringify(declaration!.replace(/\.d\.ts$/, ""))};
      export const result = columns([
        resizedNameColumn,
        lengthColumn,
        field("name", { render: (props, { getValue }) => {
          const name: string = getValue();
          // @ts-expect-error The declaration must preserve string inference.
          const invalid: number = getValue();
          return <span {...props}>{name.toUpperCase()}</span>;
        }}),
        userColumnHelper.getValue(row => row.name.length, {
          id: "computed",
          render: (props, { getValue }) => {
            const length: number = getValue();
            // @ts-expect-error Computed inference must survive the module boundary.
            const invalid: string = getValue();
            return <span {...props}>{length.toFixed(0)}</span>;
          },
        }),
      ]);
    `,
    );
    const consumerProgram = ts.createProgram([consumer], {
      ...options,
      noEmit: true,
      emitDeclarationOnly: false,
    });
    expect(messages(ts.getPreEmitDiagnostics(consumerProgram))).toEqual([]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 15_000);

"use client";

import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue,
} from "@repo/code-block";
import type { CodeBlockProps } from "@repo/code-block";

const tsCode = `interface User {
  id: string;
  name: string;
  email: string;
}

export function getUser(id: string): User {
  return {
    id,
    name: "John Doe",
    email: "john@example.com",
  };
}`;

const jsCode = `export function getUser(id) {
  return {
    id,
    name: "John Doe",
    email: "john@example.com",
  };
}`;

const data: CodeBlockProps["data"] = [
  {
    language: "typescript",
    filename: "user.ts",
    code: tsCode,
  },
  {
    language: "javascript",
    filename: "user.js",
    code: jsCode,
  },
];

const Example = () => (
  <CodeBlock data={data} defaultValue="typescript">
    <CodeBlockHeader>
      <CodeBlockSelect>
        <CodeBlockSelectTrigger>
          <CodeBlockSelectValue placeholder="Select language" />
        </CodeBlockSelectTrigger>
        <CodeBlockSelectContent>
          {(item) => (
            <CodeBlockSelectItem key={item.language} value={item.language}>
              {item.filename}
            </CodeBlockSelectItem>
          )}
        </CodeBlockSelectContent>
      </CodeBlockSelect>
      <CodeBlockCopyButton className="ml-auto" />
    </CodeBlockHeader>
    <CodeBlockBody>
      {(item) => (
        <CodeBlockItem key={item.language} value={item.language}>
          <CodeBlockContent
            language={item.language === "typescript" ? "ts" : "js"}
          >
            {item.code}
          </CodeBlockContent>
        </CodeBlockItem>
      )}
    </CodeBlockBody>
  </CodeBlock>
);

export default Example;

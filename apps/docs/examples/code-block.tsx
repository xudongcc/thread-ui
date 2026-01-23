"use client";

import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
} from "@repo/code-block";
import type { CodeBlockProps } from "@repo/code-block";

const code = `import { Button } from "@/components/ui/button";

export function Example() {
  return (
    <Button variant="outline">
      Click me
    </Button>
  );
}`;

const data: CodeBlockProps["data"] = [
  {
    language: "tsx",
    filename: "example.tsx",
    code,
  },
];

const Example = () => (
  <CodeBlock data={data} defaultValue="tsx">
    <CodeBlockHeader>
      <span className="text-muted-foreground px-3 text-xs">example.tsx</span>
      <CodeBlockCopyButton className="ml-auto" />
    </CodeBlockHeader>
    <CodeBlockBody>
      {(item) => (
        <CodeBlockItem key={item.language} value={item.language}>
          <CodeBlockContent language="tsx">{item.code}</CodeBlockContent>
        </CodeBlockItem>
      )}
    </CodeBlockBody>
  </CodeBlock>
);

export default Example;

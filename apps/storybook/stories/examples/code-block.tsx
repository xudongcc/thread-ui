import { useState } from "react";

import type { ComponentProps } from "react";
import { Button } from "@/components/thread-ui/button";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue,
} from "@/components/thread-ui/code-block";

export function FilesCodeBlockExample(args: ComponentProps<typeof CodeBlock>) {
  const [value, setValue] = useState("typescript");
  return (
    <CodeBlock {...args} value={value} onValueChange={setValue}>
      <CodeBlockHeader>
        <CodeBlockFiles>
          {(item) => (
            <Button
              key={item.language}
              aria-pressed={value === item.language}
              size="sm"
              variant={value === item.language ? "secondary" : "ghost"}
              onClick={() => setValue(item.language)}
            >
              {item.filename}
            </Button>
          )}
        </CodeBlockFiles>
        <CodeBlockCopyButton />
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
}

export function CodeBlockExample(args: ComponentProps<typeof CodeBlock>) {
  return (
    <CodeBlock {...args}>
      <CodeBlockHeader>
        <CodeBlockFiles>
          {(item) => (
            <CodeBlockFilename key={item.language} value={item.language}>
              {item.filename}
            </CodeBlockFilename>
          )}
        </CodeBlockFiles>
        <CodeBlockCopyButton />
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
}

export function LanguageSelectorCodeBlockExample(
  args: ComponentProps<typeof CodeBlock>,
) {
  return (
    <CodeBlock {...args}>
      <CodeBlockHeader>
        <CodeBlockSelect>
          <CodeBlockSelectTrigger>
            <CodeBlockSelectValue />
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
            <CodeBlockContent syntaxHighlighting={false}>
              {item.code}
            </CodeBlockContent>
          </CodeBlockItem>
        )}
      </CodeBlockBody>
    </CodeBlock>
  );
}

export function WithoutHighlightingCodeBlockExample(
  args: ComponentProps<typeof CodeBlock>,
) {
  return (
    <CodeBlock {...args}>
      <CodeBlockBody>
        {(item) => (
          <CodeBlockItem
            key={item.language}
            lineNumbers={false}
            value={item.language}
          >
            <CodeBlockContent syntaxHighlighting={false}>
              {item.code}
            </CodeBlockContent>
          </CodeBlockItem>
        )}
      </CodeBlockBody>
    </CodeBlock>
  );
}

// Keep Code panel component names stable in production builds.
FilesCodeBlockExample.displayName = "FilesCodeBlockExample";
CodeBlockExample.displayName = "CodeBlockExample";
LanguageSelectorCodeBlockExample.displayName =
  "LanguageSelectorCodeBlockExample";
WithoutHighlightingCodeBlockExample.displayName =
  "WithoutHighlightingCodeBlockExample";

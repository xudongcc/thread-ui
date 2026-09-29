import { useState } from "react";
import type { ComponentProps } from "react";
import { Button } from "@/components/thread-ui/button";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
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

FilesCodeBlockExample.displayName = "FilesCodeBlockExample";

import type { ComponentProps } from "react";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockItem,
} from "@/components/thread-ui/code-block";

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

WithoutHighlightingCodeBlockExample.displayName =
  "WithoutHighlightingCodeBlockExample";

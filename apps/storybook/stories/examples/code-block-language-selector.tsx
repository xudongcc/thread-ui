import type { ComponentProps } from "react";
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
} from "@/components/thread-ui/code-block";

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

LanguageSelectorCodeBlockExample.displayName =
  "LanguageSelectorCodeBlockExample";

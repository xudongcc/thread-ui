import { useState } from "react";
import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
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

const data = [
  {
    language: "typescript",
    filename: "greeting.ts",
    code: "export const greet = (name: string) => `Hello, ${name}!`;",
  },
  {
    language: "javascript",
    filename: "greeting.js",
    code: "export const greet = (name) => `Hello, ${name}!`;",
  },
];
const meta = {
  id: "components-codeblock",
  title: "Display/CodeBlock",
  component: CodeBlock,
  args: { data, defaultValue: "typescript" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Composable syntax-highlighted code with filename tabs or a language selector, copy action, line numbers, and notation highlights. Each data item needs a unique language key.",
      },
    },
  },
  render: (args) => (
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
  ),
} satisfies Meta<typeof CodeBlock>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Composition API",
  // TODO(a11y): color-contrast and svg-img-alt: filename text and language icon.
  parameters: { a11y: { test: "todo" } },
  args: { data: [data[0]] },
};
export const Files: Story = {
  render: function Files(args) {
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
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "greeting.js" }));
    await expect(canvasElement.querySelector("pre")).toHaveTextContent(
      data[1].code,
    );
  },
};
export const LanguageSelector: Story = {
  // TODO(a11y): color-contrast: selected language text on the muted trigger.
  parameters: { a11y: { test: "todo" } },
  render: (args) => (
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
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox"));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await body.findByRole("option", { name: "greeting.js" }),
    );
    await expect(canvas.getByText(data[1].code)).toBeVisible();
  },
};
export const Notation: Story = {
  // TODO(a11y): color-contrast and svg-img-alt: filename text and language icon.
  parameters: { a11y: { test: "todo" } },
  args: {
    data: [
      {
        ...data[0],
        code: "const previous = false; // [!code --]\nconst current = true; // [!code ++]\nconsole.log(current); // [!code highlight]",
      },
    ],
  },
};
export const WithoutHighlighting: Story = {
  render: (args) => (
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
  ),
};

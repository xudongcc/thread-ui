import { expect, within } from "storybook/test";
import {
  CodeBlockExample,
  FilesCodeBlockExample,
  LanguageSelectorCodeBlockExample,
  WithoutHighlightingCodeBlockExample,
} from "./examples/code-block";
import implementation from "./examples/code-block.tsx?raw";
import { withExampleSource } from "./utils/example-source";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "@/components/thread-ui/code-block";

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
      source: withExampleSource(implementation),
      description: {
        component:
          "Composable syntax-highlighted code with filename tabs or a language selector, copy action, line numbers, and notation highlights. Each data item needs a unique language key.",
      },
    },
  },
  render: (args) => <CodeBlockExample {...args} />,
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
  render: (args) => <FilesCodeBlockExample {...args} />,
  parameters: { docs: { source: withExampleSource(implementation) } },
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
  render: (args) => <LanguageSelectorCodeBlockExample {...args} />,
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
  render: (args) => <WithoutHighlightingCodeBlockExample {...args} />,
};

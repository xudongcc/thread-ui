import { expect, within } from "storybook/test";
import { testOnly } from "./utils/test-only";
import { CodeBlockExample } from "./examples/code-block";
import { FilesCodeBlockExample } from "./examples/code-block-files";
import { LanguageSelectorCodeBlockExample } from "./examples/code-block-language-selector";
import { WithoutHighlightingCodeBlockExample } from "./examples/code-block-without-highlighting";
import filesSource from "./examples/code-block-files.tsx?raw";
import languageSource from "./examples/code-block-language-selector.tsx?raw";
import plainSource from "./examples/code-block-without-highlighting.tsx?raw";
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
  parameters: { docs: { source: withExampleSource(filesSource) } },
  play: testOnly(async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "greeting.js" }));
    await expect(canvasElement.querySelector("pre")).toHaveTextContent(
      data[1].code,
    );
  }),
};
export const LanguageSelector: Story = {
  // TODO(a11y): color-contrast: selected language text on the muted trigger.
  parameters: {
    a11y: { test: "todo" },
    docs: { source: withExampleSource(languageSource) },
  },
  render: (args) => <LanguageSelectorCodeBlockExample {...args} />,
  play: testOnly(async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox"));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await body.findByRole("option", { name: "greeting.js" }),
    );
    await expect(canvas.getByText(data[1].code)).toBeVisible();
  }),
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
  parameters: { docs: { source: withExampleSource(plainSource) } },
  render: (args) => <WithoutHighlightingCodeBlockExample {...args} />,
};

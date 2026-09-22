import { expect, waitFor } from "storybook/test";
import { testOnly } from "./utils/test-only";
import { withExampleSource } from "./utils/example-source";
import {
  AutomaticUploadExample,
  ManualUploadExample,
  RetryFailureExample,
} from "./examples/upload-workflow";
import workflowSource from "./examples/upload-workflow.tsx?raw";
import statesSource from "./examples/upload-states.tsx?raw";
import UploadStates from "./examples/upload-states";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadDropzoneDescription,
  FileUploadDropzoneIcon,
  FileUploadList,
} from "@/components/thread-ui/file-upload";

const meta = {
  id: "components-fileupload",
  title: "Forms/FileUpload",
  component: FileUpload<string>,
  args: {
    multiple: true,
    description: "Choose files, drop them here, or paste from your clipboard.",
    "aria-label": "Attachments",
  },
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  argTypes: { value: { control: false }, defaultValue: { control: false } },
  render: (args) => <FileUpload {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          "### Props API\nPass selection and upload options to FileUpload; its dropzone and attachment list render automatically. This is the default example.\n\n### Composition API\nPass children to replace the layout with FileUploadDropzone and FileUploadList.\n\n### Imperative actions\nUse a FileUploadHandle ref (Manual Upload) or useFileUpload inside custom children to start, retry, cancel, or remove tasks. These actions operate on a mounted component; they are not a global function API. All uploads here are simulated locally.",
      },
    },
  },
} satisfies Meta<typeof FileUpload<string>>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
};
export const SingleFile: Story = {
  args: { multiple: false },
};
export const AcceptedTypes: Story = {
  args: {
    accept: "image/*,.pdf",
    description: "Images and PDF documents only.",
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const SelectAndRemove: Story = {
  globals: { locale: "en" },
  play: testOnly(async ({ canvas, canvasElement, userEvent }) => {
    const input = canvasElement.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(
      input,
      new File(["Example"], "readme.txt", { type: "text/plain" }),
    );
    await expect(canvas.getByText("readme.txt")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Remove readme.txt" }),
    );
    await expect(canvas.queryByText("readme.txt")).not.toBeInTheDocument();
  }),
};
export const AutomaticUpload: Story = {
  parameters: { docs: { source: withExampleSource(workflowSource) } },
  render: (args) => <AutomaticUploadExample {...args} />,
};
export const ManualUpload: Story = {
  parameters: {
    docs: {
      source: withExampleSource(workflowSource),
      description: {
        story:
          "Keep the Props API layout and call `ref.current?.upload()` from an external button. The ref belongs to this FileUpload instance.",
      },
    },
  },
  render: (args) => <ManualUploadExample {...args} />,
  args: { autoUpload: false, concurrency: 1 },
  play: testOnly(async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.upload(
      canvasElement.querySelector('input[type="file"]') as HTMLInputElement,
      new File(["Demo"], "report.txt", { type: "text/plain" }),
    );
    await expect(canvas.getByLabelText("Completed uploads")).toHaveTextContent(
      "No uploads completed",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Start upload" }));
    await waitFor(() =>
      expect(canvas.getByLabelText("Completed uploads")).toHaveTextContent(
        "Completed: report.txt",
      ),
    );
  }),
};
export const RetryFailure: Story = {
  parameters: { docs: { source: withExampleSource(workflowSource) } },
  globals: { locale: "en" },
  render: (args) => <RetryFailureExample {...args} />,
  play: testOnly(async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.upload(
      canvasElement.querySelector('input[type="file"]') as HTMLInputElement,
      new File(["Demo"], "retry.txt", { type: "text/plain" }),
    );
    await userEvent.click(
      await canvas.findByRole("button", { name: "Retry upload of retry.txt" }),
    );
    await waitFor(() =>
      expect(canvas.getByLabelText("Completed uploads")).toHaveTextContent(
        "Completed: retry.txt",
      ),
    );
  }),
};
export const States: Story = {
  // TODO(a11y): color-contrast: failed upload status text.
  parameters: {
    a11y: { test: "todo" },
    docs: { source: { code: statesSource, language: "tsx" } },
  },
  render: () => <UploadStates />,
};
export const Composition: Story = {
  name: "Composition API",
  parameters: {
    docs: {
      description: {
        story:
          "Replace the default layout with child components. Selection state remains shared through FileUpload.",
      },
    },
  },
  render: (args) => (
    <FileUpload {...args}>
      <FileUploadDropzone>
        <FileUploadDropzoneIcon />
        <FileUploadDropzoneDescription>
          Drop your attachments here
        </FileUploadDropzoneDescription>
      </FileUploadDropzone>
      <FileUploadList />
    </FileUpload>
  ),
};

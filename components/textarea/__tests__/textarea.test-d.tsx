import { Textarea } from "../index";
import type { ComponentProps } from "react";
import type { TextareaProps } from "../index";

const TextareaApi = () => (
  <Textarea
    description="Please provide detailed feedback."
    error="Message is required"
    label="Message"
    placeholder="Enter your message"
  />
);

const textareaProps: TextareaProps = {
  label: "Notes",
  description: "Internal notes only.",
  error: "Notes are required.",
  disabled: true,
};

const textareaComponentProps: ComponentProps<typeof Textarea> = textareaProps;

export { TextareaApi, textareaComponentProps };

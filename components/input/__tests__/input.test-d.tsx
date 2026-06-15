import { Input } from "../index";
import type { ComponentProps } from "react";
import type { InputProps } from "../index";

const InputApi = () => (
  <Input
    description="We'll send you a verification email"
    error="Email is required"
    label="Email"
    placeholder="your@email.com"
    type="email"
  />
);

const inputProps: InputProps = {
  label: "Name",
  description: "Use your legal name.",
  error: "Name is required.",
  disabled: true,
};

const inputComponentProps: ComponentProps<typeof Input> = inputProps;

export { InputApi, inputComponentProps };

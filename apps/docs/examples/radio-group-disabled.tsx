import { RadioGroup } from "@/components/thread-ui/radio-group";

const Example = () => (
  <RadioGroup
    disabled
    defaultValue="standard"
    description="Choose how your order should be delivered."
    label="Shipping Method"
    items={[
      { value: "standard", label: "Standard" },
      { value: "express", label: "Express" },
      { value: "overnight", label: "Overnight" },
    ]}
  />
);

export default Example;

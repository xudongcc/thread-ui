import { RadioGroup } from "@/components/thread-ui/radio-group";

const Example = () => (
  <RadioGroup
    defaultValue="standard"
    description="Choose how your order should be delivered."
    label="Shipping Method"
    items={[
      {
        value: "standard",
        label: "Standard",
        description: "Delivery in 5-7 business days.",
      },
      {
        value: "express",
        label: "Express",
        description: "Delivery in 2-3 business days.",
      },
      {
        value: "overnight",
        label: "Overnight",
        description: "Delivery by next business day.",
      },
    ]}
  />
);

export default Example;

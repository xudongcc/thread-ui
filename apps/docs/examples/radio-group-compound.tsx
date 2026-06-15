import { RadioGroup, RadioGroupItem } from "@/components/thread-ui/radio-group";

const Example = () => (
  <RadioGroup
    defaultValue="standard"
    description="Choose how your order should be delivered."
    label="Shipping Method"
  >
    <RadioGroupItem
      description="Delivery in 5-7 business days."
      value="standard"
    >
      Standard
    </RadioGroupItem>
    <RadioGroupItem
      description="Delivery in 2-3 business days."
      value="express"
    >
      Express
    </RadioGroupItem>
    <RadioGroupItem
      description="Delivery by next business day."
      value="overnight"
    >
      Overnight
    </RadioGroupItem>
  </RadioGroup>
);

export default Example;

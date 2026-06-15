import { RadioGroup, RadioGroupItem } from "../index";
import type { RadioGroupOptionProps, RadioGroupProps } from "../index";

const radioItems: Array<
  RadioGroupOptionProps<"standard" | "express" | "overnight">
> = [
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
  { value: "overnight", label: "Overnight", disabled: true },
];

const RadioGroupApi = () => (
  <RadioGroup
    defaultValue="standard"
    description="Choose how your order should be delivered."
    items={radioItems}
    label="Shipping Method"
  />
);

const RadioGroupCompoundApi = () => (
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

const radioGroupProps: RadioGroupProps<string | null> = {
  defaultValue: "standard",
  description: "Choose how your order should be delivered.",
  items: radioItems,
  label: "Shipping Method",
  onValueChange: () => undefined,
};

const radioGroupCompoundProps: RadioGroupProps<string | null> = {
  children: <RadioGroupItem value="standard">Standard</RadioGroupItem>,
  defaultValue: "standard",
  description: "Choose how your order should be delivered.",
  label: "Shipping Method",
};

// @ts-expect-error items are unavailable when children are supplied.
const radioGroupMixedProps: RadioGroupProps<string | null> = {
  children: <RadioGroupItem value="standard">Standard</RadioGroupItem>,
  items: radioItems,
  label: "Shipping Method",
};

const radioGroupItemLabelProp = (
  // @ts-expect-error RadioGroupItem uses children instead of a label prop.
  <RadioGroupItem label="Standard" value="standard" />
);

export {
  RadioGroupApi,
  RadioGroupCompoundApi,
  radioGroupCompoundProps,
  radioGroupItemLabelProp,
  radioGroupMixedProps,
  radioGroupProps,
};

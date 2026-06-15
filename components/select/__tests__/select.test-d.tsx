import { Select } from "../index";
import type { SelectItemProps, SelectProps } from "../index";

const selectItems: Array<SelectItemProps> = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
];

const SelectApi = () => (
  <Select
    description="Select your country of residence"
    error="Country is required"
    items={selectItems}
    label="Country"
    placeholder="Choose a country"
  />
);

const selectProps: SelectProps<string | null> = {
  label: "Theme",
  placeholder: "Select theme",
  items: selectItems,
  value: "us",
  onValueChange: () => undefined,
};

export { SelectApi, selectProps };

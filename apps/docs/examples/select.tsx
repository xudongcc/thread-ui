import { Select } from "@/components/thread-ui/select";

const Example = () => (
  <Select
    description="Select your country of residence"
    label="Country"
    placeholder="Choose a country"
    items={[
      { value: "us", label: "United States" },
      { value: "uk", label: "United Kingdom" },
      { value: "ca", label: "Canada" },
      { value: "au", label: "Australia" },
      { value: "de", label: "Germany" },
    ]}
  />
);

export default Example;

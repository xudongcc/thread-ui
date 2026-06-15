import { Select } from "@/components/thread-ui/select";

const Example = () => (
  <Select
    error="Please select a language"
    label="Language"
    placeholder="Choose a language"
    items={[
      { value: "en", label: "English" },
      { value: "es", label: "Spanish" },
      { value: "fr", label: "French" },
      { value: "de", label: "German" },
    ]}
  />
);

export default Example;

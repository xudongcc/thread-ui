import { Select } from "@/components/thread-ui/select";

const Example = () => (
  <Select
    disabled
    defaultValue="active"
    description="This field cannot be modified"
    label="Status"
    items={[
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "pending", label: "Pending" },
    ]}
  />
);

export default Example;

import { Input } from "@/components/thread-ui/input";

const Example = () => (
  <Input
    disabled
    description="This field cannot be modified"
    label="Username"
    value="john.doe"
  />
);

export default Example;

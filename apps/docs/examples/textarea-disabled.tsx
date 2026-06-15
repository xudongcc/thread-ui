import { Textarea } from "@/components/thread-ui/textarea";

const Example = () => (
  <Textarea
    disabled
    label="Notes"
    placeholder="This field is disabled"
    value="This content cannot be edited"
  />
);

export default Example;

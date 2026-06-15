import { Input } from "@/components/thread-ui/input";

const Example = () => (
  <Input
    error="Password must be at least 8 characters"
    label="Password"
    placeholder="Enter your password"
    type="password"
  />
);

export default Example;

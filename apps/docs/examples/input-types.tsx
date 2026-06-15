import { Input } from "@/components/thread-ui/input";

const Example = () => (
  <div className="space-y-4">
    <Input label="Email" placeholder="your@email.com" type="email" />

    <Input label="Password" placeholder="Enter password" type="password" />

    <Input label="Age" placeholder="Enter your age" type="number" />

    <Input label="Birth Date" type="date" />
  </div>
);

export default Example;

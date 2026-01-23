import { Button } from "@repo/button";

const Example = () => (
  <div className="flex flex-wrap gap-2">
    <Button>Default</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="link">Link</Button>
  </div>
);

export default Example;

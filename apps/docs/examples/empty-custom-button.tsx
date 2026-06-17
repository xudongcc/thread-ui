import { ArrowUpRightIcon, FolderCodeIcon } from "lucide-react";

import { Button } from "@/components/thread-ui/button";
import { Empty } from "@/components/thread-ui/empty";

const Example = () => (
  <Empty
    description="Bring your own action buttons when you need custom labels, icons, or composition."
    icon={<FolderCodeIcon />}
    primaryAction={<Button>Create Project</Button>}
    title="No Projects Yet"
    secondaryAction={
      <Button variant="outline">
        <ArrowUpRightIcon />
        Import Project
      </Button>
    }
  />
);

export default Example;

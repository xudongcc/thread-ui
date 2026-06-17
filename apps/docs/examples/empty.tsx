import { ArrowUpRightIcon, FolderCodeIcon } from "lucide-react";

import { Empty } from "@/components/thread-ui/empty";

const Example = () => (
  <Empty
    description="You haven't created any projects yet. Get started by creating your first project."
    icon={<FolderCodeIcon />}
    title="No Projects Yet"
    primaryAction={{
      label: "Create Project",
    }}
    secondaryAction={{
      icon: <ArrowUpRightIcon />,
      label: "Import Project",
      variant: "outline",
    }}
  />
);

export default Example;

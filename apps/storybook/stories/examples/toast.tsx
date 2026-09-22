import { toast } from "@/components/thread-ui/toast";
import { Button } from "@/components/thread-ui/button";

export default function ToastExample(options: Parameters<typeof toast.add>[0]) {
  return (
    <Button variant="outline" onClick={() => toast.add(options)}>
      Show notification
    </Button>
  );
}

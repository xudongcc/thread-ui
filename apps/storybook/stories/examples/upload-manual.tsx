import { UploadExample, simulateUpload } from "./upload-workflow";
import type { FileUploadProps } from "@/components/thread-ui/file-upload";

export function ManualUploadExample(args: FileUploadProps<string>) {
  return (
    <UploadExample
      autoUpload={false}
      concurrency={1}
      onUpload={simulateUpload}
      {...args}
    />
  );
}

ManualUploadExample.displayName = "ManualUploadExample";

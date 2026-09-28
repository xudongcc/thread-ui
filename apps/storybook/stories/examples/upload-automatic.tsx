import { UploadExample, simulateUpload } from "./upload-workflow";
import type { FileUploadProps } from "@/components/thread-ui/file-upload";

export function AutomaticUploadExample(args: FileUploadProps<string>) {
  return <UploadExample onUpload={simulateUpload} {...args} />;
}

AutomaticUploadExample.displayName = "AutomaticUploadExample";

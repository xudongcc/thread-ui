import { useRef } from "react";
import { UploadExample, simulateUpload } from "./upload-workflow";
import type { FileUploadProps } from "@/components/thread-ui/file-upload";

export function RetryFailureExample(args: FileUploadProps<string>) {
  const attempts = useRef(0);
  return (
    <UploadExample
      {...args}
      onUpload={async (context) => {
        if (attempts.current++ === 0)
          throw new Error("Simulated failure. Retry to continue.");
        return simulateUpload(context);
      }}
    />
  );
}

RetryFailureExample.displayName = "RetryFailureExample";

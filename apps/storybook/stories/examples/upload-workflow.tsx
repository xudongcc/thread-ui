import { useRef, useState } from "react";
import type {
  FileUploadHandle,
  FileUploadProps,
  FileUploadTaskContext,
} from "@/components/thread-ui/file-upload";
import { FileUpload } from "@/components/thread-ui/file-upload";
import { Button } from "@/components/thread-ui/button";

// A local simulation: selected file contents never leave the browser.
export async function simulateUpload({
  file,
  signal,
  onProgress,
}: FileUploadTaskContext) {
  for (let progress = 25; progress <= 100; progress += 25) {
    await new Promise<void>((resolve, reject) => {
      signal.throwIfAborted();
      const abort = () => {
        clearTimeout(timer);
        reject(signal.reason);
      };
      const timer = setTimeout(() => {
        signal.removeEventListener("abort", abort);
        resolve();
      }, 100);
      signal.addEventListener("abort", abort, { once: true });
    });
    onProgress(progress);
  }
  return file.name;
}
export function UploadExample(args: FileUploadProps<string>) {
  const handle = useRef<FileUploadHandle<string>>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  return (
    <div className="space-y-3">
      <FileUpload {...args} ref={handle} onUploadComplete={setCompleted} />
      {args.onUpload && args.autoUpload === false && (
        <Button onClick={() => handle.current?.upload()}>Start upload</Button>
      )}
      <output aria-label="Completed uploads">
        {completed.length
          ? `Completed: ${completed.join(", ")}`
          : "No uploads completed"}
      </output>
    </div>
  );
}

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

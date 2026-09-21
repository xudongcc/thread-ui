"use client";

import { useState } from "react";

import { FileUpload } from "@/components/thread-ui/file-upload";

// This demo simulates a backend; it never sends selected files over the network.
const delay = (signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    signal.throwIfAborted();
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, 300);
    signal.addEventListener("abort", onAbort, { once: true });
  });

const Example = () => {
  const [uploaded, setUploaded] = useState<string[]>([]);
  return (
    <div className="w-full max-w-md space-y-3">
      <FileUpload
        multiple
        concurrency={2}
        description="Simulated upload with preparation and processing. Files stay in your browser."
        title="Upload attachments"
        onChange={() => setUploaded([])}
        onUpload={async ({ file, signal, setStage, onProgress }) => {
          await delay(signal);
          setStage("uploading");
          for (let progress = 20; progress <= 100; progress += 20) {
            await delay(signal);
            onProgress(progress);
          }
          setStage("processing");
          await delay(signal);
          return { name: file.name };
        }}
        onUploadComplete={(results) =>
          setUploaded(results.map((result) => result.name))
        }
      />
      {uploaded.length > 0 && (
        <p className="text-muted-foreground text-sm">
          Completed: {uploaded.join(", ")}
        </p>
      )}
    </div>
  );
};

export default Example;

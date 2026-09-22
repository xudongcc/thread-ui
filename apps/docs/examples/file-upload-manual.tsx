"use client";

import { useRef, useState } from "react";

import type { FileUploadHandle } from "@/components/thread-ui/file-upload";
import { Button } from "@/components/ui/button";
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
  const uploadRef = useRef<FileUploadHandle<{ name: string }>>(null);
  const [uploaded, setUploaded] = useState<string[]>([]);
  return (
    <div className="w-full max-w-md space-y-3">
      <FileUpload
        ref={uploadRef}
        multiple
        autoUpload={false}
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
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => uploadRef.current?.openFileDialog()}
        >
          Choose files
        </Button>
        <Button type="button" onClick={() => uploadRef.current?.upload()}>
          Start upload
        </Button>
      </div>
      {uploaded.length > 0 && (
        <p className="text-muted-foreground text-sm">
          Completed: {uploaded.join(", ")}
        </p>
      )}
    </div>
  );
};

export default Example;

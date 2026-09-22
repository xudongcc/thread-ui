"use client";

import { useEffect, useRef, useState } from "react";

import type { FileUploadHandle } from "@/components/thread-ui/file-upload";
import {
  FileUpload,
  FileUploadItem,
  useFileUpload,
} from "@/components/thread-ui/file-upload";
import { Button } from "@/components/ui/button";

const samples = [
  { name: "selected-file.pdf", status: "idle", priority: 4 },
  { name: "queued-document.pdf", status: "queued", priority: 3 },
  { name: "design-system.zip", status: "uploading", priority: 2 },
  { name: "uploaded-report.pdf", status: "done", priority: 0 },
  { name: "financial-model.xlsx", status: "error", priority: 1 },
  { name: "canceled-document.pdf", status: "canceled", priority: 5 },
] as const;

const StateItems = ({
  onFinish,
  onReset,
}: {
  onFinish: () => void;
  onReset: () => void;
}) => {
  const { entries, remove } = useFileUpload();

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {samples.map((sample) => {
          const entry = entries.find((item) => item.file.name === sample.name);
          return entry ? (
            <FileUploadItem
              key={entry.id}
              file={entry.file}
              onRemove={() => remove(entry.id)}
            />
          ) : null;
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!entries.some((entry) => entry.status === "uploading")}
          type="button"
          variant="outline"
          onClick={onFinish}
        >
          Finish active upload
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          Reset example
        </Button>
      </div>
    </div>
  );
};

const StateExamples = ({ onReset }: { onReset: () => void }) => {
  const uploadRef = useRef<FileUploadHandle<string>>(null);
  const finishRef = useRef<(() => void) | null>(null);
  const failedOnce = useRef(false);
  const [files] = useState(() =>
    [...samples]
      .sort((a, b) => a.priority - b.priority)
      .map(({ name }) => new File(["Demo attachment"], name)),
  );

  useEffect(() => {
    const handle = uploadRef.current;
    if (!handle) return;
    for (const entry of handle.getEntries()) {
      const sample = samples.find((item) => item.name === entry.file.name)!;
      if (sample.status === "canceled") handle.cancel(entry.id);
      else if (sample.status !== "idle") handle.upload(entry.id);
    }
  }, []);

  return (
    <FileUpload
      ref={uploadRef}
      multiple
      autoUpload={false}
      concurrency={1}
      defaultValue={files}
      onUpload={async ({ file, signal, onProgress }) => {
        // Seed completed/failed examples before holding the queue at 64%.
        // All files and upload results stay in this demo.
        if (file.name === "uploaded-report.pdf") return file.name;
        if (file.name === "financial-model.xlsx" && !failedOnce.current) {
          failedOnce.current = true;
          throw new Error("Simulated upload failure. Retry this attachment.");
        }
        onProgress(64);
        await new Promise<void>((resolve, reject) => {
          signal.throwIfAborted();
          const cleanup = () => {
            signal.removeEventListener("abort", abort);
            if (finishRef.current === finish) finishRef.current = null;
          };
          const finish = () => {
            cleanup();
            onProgress(100);
            resolve();
          };
          const abort = () => {
            cleanup();
            reject(signal.reason);
          };
          finishRef.current = finish;
          signal.addEventListener("abort", abort, { once: true });
        });
        return file.name;
      }}
    >
      <StateItems onFinish={() => finishRef.current?.()} onReset={onReset} />
    </FileUpload>
  );
};

const Example = () => {
  const [version, setVersion] = useState(0);
  return (
    <div className="w-full max-w-lg">
      <StateExamples
        key={version}
        onReset={() => setVersion((current) => current + 1)}
      />
    </div>
  );
};

export default Example;

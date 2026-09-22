"use client";

import { useLayoutEffect, useState, useSyncExternalStore } from "react";

import { FileUploadQueue } from "./upload-queue";
import type { FileUploadOptions } from "./upload-queue";

export const useUploadQueue = <TResult>(
  files: File[],
  options: FileUploadOptions<TResult> & {
    disabled?: boolean;
    multiple?: boolean;
  },
  onSelectionChange: (files: File[]) => void,
) => {
  const [selectionRevision, setSelectionRevision] = useState(0);
  const [store] = useState(() => new FileUploadQueue<TResult>());
  const entries = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  useLayoutEffect(() => {
    store.configure(
      files,
      {
        ...options,
        onSelectionChange: (nextFiles, revision) => {
          // Even a rejected controlled change needs a commit to settle its draft.
          setSelectionRevision(revision);
          onSelectionChange(nextFiles);
        },
      },
      selectionRevision,
    );
  });
  useLayoutEffect(() => {
    store.activate();
    return () => store.deactivate();
  }, [store]);

  return {
    entries,
    getEntries: store.getSnapshot,
    upload: store.upload,
    retry: store.retry,
    cancel: store.cancel,
    addFiles: store.addFiles,
    removeFile: store.removeFile,
    remove: store.remove,
  };
};

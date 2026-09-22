"use client";

import { useLayoutEffect, useState, useSyncExternalStore } from "react";

import { FileUploadQueue } from "./upload-queue";
import type { FileUploadOptions } from "./upload-queue";

export const useUploadQueue = <TResult>(
  files: File[],
  options: FileUploadOptions<TResult> & { disabled?: boolean },
) => {
  const [store] = useState(() => new FileUploadQueue<TResult>());
  const entries = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  useLayoutEffect(() => {
    store.configure(files, options);
  });
  useLayoutEffect(() => {
    store.activate();
    return () => store.deactivate();
  }, [store]);

  return {
    entries,
    upload: store.upload,
    retry: store.retry,
    cancel: store.cancel,
    prepareRemove: store.prepareRemove,
    prepareSelection: store.prepareSelection,
  };
};

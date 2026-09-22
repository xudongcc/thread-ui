import PQueue from "p-queue";

export type FileUploadStage = "preparing" | "uploading" | "processing";
export type FileUploadStatus =
  | "idle"
  | "queued"
  | FileUploadStage
  | "done"
  | "error"
  | "canceled";

export interface FileUploadEntry<TResult = unknown> {
  id: string;
  file: File;
  status: FileUploadStatus;
  /** File transfer progress from 0 to 100, not overall workflow progress. */
  progress?: number;
  result?: TResult;
  error?: Error;
}

export interface FileUploadTaskContext {
  file: File;
  signal: AbortSignal;
  setStage: (stage: FileUploadStage) => void;
  onProgress: (percent: number) => void;
}

export interface FileUploadOptions<TResult = unknown> {
  onUpload?: (context: FileUploadTaskContext) => Promise<TResult>;
  /** Automatically enqueue selected files. Defaults to true. */
  autoUpload?: boolean;
  /** Maximum simultaneous upload workflows. Defaults to 3. */
  concurrency?: number;
  /** All currently selected files succeeded; results follow selection order. */
  onUploadComplete?: (results: TResult[]) => void;
  onUploadError?: (error: Error, entry: FileUploadEntry<TResult>) => void;
}

type Options<TResult> = FileUploadOptions<TResult> & { disabled?: boolean };

/** Internal store: selection order and task identity are independent of queue order. */
export class FileUploadQueue<TResult> {
  private queue = new PQueue({ autoStart: false, concurrency: 3 });
  private entries: FileUploadEntry<TResult>[] = [];
  private listeners = new Set<() => void>();
  private controllers = new Map<string, AbortController>();
  private options: Options<TResult> = {};
  private selectionIds = new WeakMap<File[], (string | undefined)[]>();
  private removalRequests = new Set<string>();
  private nextId = 0;
  private active = false;
  private scheduled = false;
  private completionPending = false;

  getSnapshot = () => this.entries;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private publish() {
    for (const listener of this.listeners) listener();
  }

  private update(id: string, patch: Partial<FileUploadEntry<TResult>>) {
    this.entries = this.entries.map((entry) =>
      entry.id === id ? { ...entry, ...patch } : entry,
    );
    this.publish();
  }

  configure(files: File[], options: Options<TResult>) {
    const concurrency = options.concurrency ?? 3;
    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new RangeError(
        "FileUpload concurrency must be a positive integer.",
      );
    }
    this.options = options;
    this.queue.pause();
    this.queue.concurrency = concurrency;

    // Match each occurrence once, even when the same File is selected twice.
    const remaining = [...this.entries];
    const removed: FileUploadEntry<TResult>[] = [];
    for (const id of this.removalRequests) {
      const index = remaining.findIndex((entry) => entry.id === id);
      if (index < 0) {
        this.removalRequests.delete(id);
        continue;
      }
      const file = remaining[index]!.file;
      if (
        remaining.filter((entry) => entry.file === file).length >
        files.filter((item) => item === file).length
      ) {
        removed.push(...remaining.splice(index, 1));
        this.removalRequests.delete(id);
      }
    }
    // Local actions know which occurrences survived a batch. Consume their IDs
    // only when the parent accepts that exact selection array; otherwise keep
    // reconciling external controlled values by File identity.
    const ids = this.selectionIds.get(files);
    this.selectionIds.delete(files);
    const next = files.map((file, fileIndex) => {
      const index = remaining.findIndex(
        (entry) => entry.file === file && (!ids || entry.id === ids[fileIndex]),
      );
      if (index >= 0) return remaining.splice(index, 1)[0]!;
      this.completionPending = true;
      return { id: String(++this.nextId), file, status: "idle" as const };
    });
    const changed =
      next.length !== this.entries.length ||
      next.some((entry, i) => entry !== this.entries[i]);
    this.entries = changed ? next : this.entries;
    for (const entry of [...removed, ...remaining]) this.abort(entry.id);
    if (changed) this.publish();
    this.schedule();
  }

  activate() {
    this.active = true;
    this.schedule();
  }

  deactivate() {
    this.active = false;
    this.queue.pause();
    for (const id of this.controllers.keys()) this.abort(id);
    // Strict Mode may activate the same store again. Never retain aborted work.
    this.entries = this.entries.map((entry) =>
      ["queued", "preparing", "uploading", "processing"].includes(entry.status)
        ? { ...entry, status: "idle", progress: undefined }
        : entry,
    );
  }

  private abort(id: string) {
    const controller = this.controllers.get(id);
    this.controllers.delete(id);
    controller?.abort();
  }

  private schedule() {
    if (this.scheduled) return;
    this.scheduled = true;
    queueMicrotask(() => {
      this.scheduled = false;
      if (!this.active) return;
      if (!this.options.disabled) {
        if (this.options.autoUpload !== false) this.upload();
        this.queue.start();
      }
      if (
        this.completionPending &&
        this.entries.length > 0 &&
        this.entries.every((entry) => entry.status === "done")
      ) {
        this.completionPending = false;
        this.options.onUploadComplete?.(
          this.entries.map((entry) => entry.result as TResult),
        );
      }
    });
  }

  upload = (id?: string) => {
    if (!this.active || this.options.disabled || !this.options.onUpload) return;
    for (const entry of this.entries) {
      if (entry.status === "idle" && (id === undefined || entry.id === id))
        this.enqueue(entry);
    }
  };

  retry = (id: string) => {
    if (!this.active || this.options.disabled || !this.options.onUpload) return;
    const entry = this.entries.find((entry) => entry.id === id);
    if (entry && (entry.status === "error" || entry.status === "canceled"))
      this.enqueue(entry);
  };

  cancel = (id: string) => {
    if (this.options.disabled) return;
    const entry = this.entries.find((entry) => entry.id === id);
    if (!entry || ["done", "error", "canceled"].includes(entry.status)) return;
    this.update(id, { status: "canceled", progress: undefined });
    this.abort(id);
    this.schedule();
  };

  prepareSelection = (files: File[], ids: (string | undefined)[]) => {
    this.selectionIds.set(files, ids);
  };

  prepareRemove = (id: string) => {
    if (this.options.disabled) return;
    this.removalRequests.add(id);
    this.cancel(id);
  };

  private enqueue(entry: FileUploadEntry<TResult>) {
    const onUpload = this.options.onUpload!;
    const controller = new AbortController();
    this.controllers.set(entry.id, controller);
    this.completionPending = true;
    this.update(entry.id, {
      status: "queued",
      progress: undefined,
      error: undefined,
      result: undefined,
    });
    const isCurrent = () =>
      this.active &&
      !controller.signal.aborted &&
      this.controllers.get(entry.id) === controller &&
      this.entries.some(
        (item) =>
          item.id === entry.id &&
          ["queued", "preparing", "uploading", "processing"].includes(
            item.status,
          ),
      );

    void this.queue
      .add(
        async () => {
          if (!isCurrent()) return;
          this.update(entry.id, { status: "preparing" });
          const result = await onUpload({
            file: entry.file,
            signal: controller.signal,
            setStage: (status) => {
              if (isCurrent()) this.update(entry.id, { status });
            },
            onProgress: (progress) => {
              if (isCurrent() && Number.isFinite(progress))
                this.update(entry.id, {
                  progress: Math.min(100, Math.max(0, progress)),
                });
            },
          });
          if (isCurrent()) this.update(entry.id, { status: "done", result });
        },
        { signal: controller.signal },
      )
      .catch((cause: unknown) => {
        if (!isCurrent()) return;
        const error = cause instanceof Error ? cause : new Error(String(cause));
        this.update(entry.id, { status: "error", error });
        // Notification errors must not become unhandled queue rejections.
        try {
          this.options.onUploadError?.(
            error,
            this.entries.find((item) => item.id === entry.id)!,
          );
        } catch (notificationError) {
          queueMicrotask(() => {
            throw notificationError;
          });
        }
      })
      .finally(() => {
        if (this.controllers.get(entry.id) === controller)
          this.controllers.delete(entry.id);
        this.schedule();
      });
  }
}

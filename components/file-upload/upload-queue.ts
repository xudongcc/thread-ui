import PQueue from "p-queue";

export type FileUploadStatus =
  | "idle"
  | "queued"
  | "uploading"
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

type Options<TResult> = FileUploadOptions<TResult> & {
  disabled?: boolean;
  multiple?: boolean;
  onSelectionChange?: (files: File[], revision: number) => void;
};

type SelectionItem = Pick<FileUploadEntry, "id" | "file">;
type SelectionRequest = {
  items: SelectionItem[];
  baseFiles: File[] | undefined;
};

/** Internal store: selection order and task identity are independent of queue order. */
export class FileUploadQueue<TResult> {
  private queue = new PQueue({ autoStart: false, concurrency: 3 });
  private entries: FileUploadEntry<TResult>[] = [];
  private listeners = new Set<() => void>();
  private controllers = new Map<string, AbortController>();
  private options: Options<TResult> = {};
  private committedFiles?: File[];
  private selectionRequests = new Map<number, SelectionRequest>();
  private selectionRevision = 0;
  private startRequests = new Map<string, "upload" | "retry">();
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

  configure(files: File[], options: Options<TResult>, revision = 0) {
    const concurrency = options.concurrency ?? 3;
    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new RangeError(
        "FileUpload concurrency must be a positive integer.",
      );
    }
    this.options = options;
    this.queue.pause();
    this.queue.concurrency = concurrency;

    // React acknowledges selection requests by revision, independently of queue
    // notifications. A new controlled array accepts the request; keeping the
    // committed array rejects it. Match File occurrences, not array identity, so
    // callers can copy, filter, or reorder the accepted selection.
    const request = this.selectionRequests.get(revision);
    const accepted = request && files !== request.baseFiles;
    const candidates = [...(accepted ? request.items : this.entries)];
    const remaining = [...this.entries];
    const next = files.map((file) => {
      const candidateIndex = candidates.findIndex((item) => item.file === file);
      const candidate =
        candidateIndex < 0
          ? undefined
          : candidates.splice(candidateIndex, 1)[0]!;
      const index = remaining.findIndex((entry) =>
        candidate ? entry.id === candidate.id : entry.file === file,
      );
      if (index >= 0) return remaining.splice(index, 1)[0]!;
      this.completionPending = true;
      return {
        id: candidate?.id ?? String(++this.nextId),
        file,
        status: "idle" as const,
      };
    });
    const changed =
      next.length !== this.entries.length ||
      next.some((entry, i) => entry !== this.entries[i]);
    this.entries = changed ? next : this.entries;
    this.committedFiles = files;
    for (const pendingRevision of this.selectionRequests.keys()) {
      if (pendingRevision <= revision)
        this.selectionRequests.delete(pendingRevision);
    }
    const retainedIds = new Set([
      ...next.map((entry) => entry.id),
      ...this.getSelection().map((item) => item.id),
    ]);
    for (const id of this.startRequests.keys()) {
      if (!retainedIds.has(id)) this.startRequests.delete(id);
    }
    for (const entry of remaining) this.abort(entry.id);
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
      ["queued", "uploading"].includes(entry.status)
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
      // A command targets the selection at call time, but work must wait until
      // React commits or rejects that selection (including controlled values).
      if (!this.active || this.selectionRequests.size > 0) return;
      if (!this.options.disabled) {
        if (this.options.onUpload) {
          for (const entry of this.entries) {
            const request = this.startRequests.get(entry.id);
            this.startRequests.delete(entry.id);
            if (
              (entry.status === "idle" &&
                (request === "upload" || this.options.autoUpload !== false)) ||
              (request === "retry" &&
                (entry.status === "error" || entry.status === "canceled"))
            )
              this.enqueue(entry);
          }
        }
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
    for (const item of this.getSelection()) {
      const entry = this.entries.find((entry) => entry.id === item.id);
      if (
        (!entry || entry.status === "idle") &&
        (id === undefined || item.id === id)
      )
        this.startRequests.set(item.id, "upload");
    }
    this.schedule();
  };

  retry = (id: string) => {
    if (!this.active || this.options.disabled || !this.options.onUpload) return;
    const entry = this.entries.find((entry) => entry.id === id);
    if (
      entry &&
      (entry.status === "error" || entry.status === "canceled") &&
      this.getSelection().some((item) => item.id === id)
    ) {
      this.startRequests.set(id, "retry");
      this.schedule();
    }
  };

  cancel = (id: string) => {
    if (this.options.disabled) return;
    this.startRequests.delete(id);
    const entry = this.entries.find((entry) => entry.id === id);
    if (!entry || ["done", "error", "canceled"].includes(entry.status)) return;
    this.update(id, { status: "canceled", progress: undefined });
    this.abort(id);
    this.schedule();
  };

  private getSelection(): SelectionItem[] {
    return [...this.selectionRequests.values()].at(-1)?.items ?? this.entries;
  }

  private requestSelection(items: SelectionItem[], removedId?: string) {
    const revision = ++this.selectionRevision;
    const files = items.map((item) => item.file);
    this.selectionRequests.set(revision, {
      items,
      baseFiles: this.committedFiles,
    });
    this.queue.pause();
    if (removedId !== undefined) this.cancel(removedId);
    this.options.onSelectionChange?.(files, revision);
  }

  addFiles = (files: File[]) => {
    if (this.options.disabled || !files.length) return;
    const additions = (this.options.multiple ? files : files.slice(0, 1)).map(
      (file) => ({ id: String(++this.nextId), file }),
    );
    this.requestSelection(
      this.options.multiple
        ? [...this.getSelection(), ...additions]
        : additions,
    );
  };

  removeFile = (index: number) => {
    if (this.options.disabled) return;
    const selection = this.getSelection();
    const item = selection[index];
    if (!item) return;
    this.requestSelection(
      selection.filter((_, i) => i !== index),
      item.id,
    );
  };

  remove = (id: string) => {
    const index = this.getSelection().findIndex((item) => item.id === id);
    if (index >= 0) this.removeFile(index);
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
          item.id === entry.id && ["queued", "uploading"].includes(item.status),
      );

    void this.queue
      .add(
        async () => {
          if (!isCurrent()) return;
          this.update(entry.id, { status: "uploading" });
          const result = await onUpload({
            file: entry.file,
            signal: controller.signal,
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

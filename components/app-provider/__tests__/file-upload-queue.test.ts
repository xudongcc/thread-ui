import { afterEach, expect, it, vi } from "vitest";

import { FileUploadQueue } from "../../file-upload/upload-queue";
import type {
  FileUploadOptions,
  FileUploadTaskContext,
} from "../../file-upload/upload-queue";

const files = ["a", "b", "c", "d"].map(
  (name) => new File([name], `${name}.txt`),
);
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
const flush = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve();
};
const stores: FileUploadQueue<string>[] = [];
const setup = (selected: File[], options: FileUploadOptions<string>) => {
  const store = new FileUploadQueue<string>();
  stores.push(store);
  store.configure(selected, options);
  store.activate();
  return store;
};
afterEach(() => {
  stores.forEach((store) => store.deactivate());
  stores.length = 0;
});

it("limits concurrency and returns all results once in selection order", async () => {
  const tasks = files.map(() => deferred<string>());
  const onUpload = vi.fn(
    ({ file }: FileUploadTaskContext) => tasks[files.indexOf(file)]!.promise,
  );
  const onUploadComplete = vi.fn();
  const options = { onUpload, onUploadComplete, concurrency: 2 };
  const store = setup(files, options);
  await flush();
  expect(onUpload).toHaveBeenCalledTimes(2);
  tasks[1]!.resolve("b-url");
  await flush();
  expect(onUpload).toHaveBeenCalledTimes(3);
  tasks[2]!.resolve("c-url");
  await flush();
  expect(onUpload).toHaveBeenCalledTimes(4);
  tasks[3]!.resolve("d-url");
  await flush();
  expect(onUploadComplete).not.toHaveBeenCalled();
  tasks[0]!.resolve("a-url");
  await flush();
  expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith([
    "a-url",
    "b-url",
    "c-url",
    "d-url",
  ]);
  store.configure([...files], options);
  await flush();
  expect(onUploadComplete).toHaveBeenCalledTimes(1);
});

it("waits for appended files and includes the final processing stage", async () => {
  const tasks = [deferred<string>(), deferred<string>()];
  const contexts: FileUploadTaskContext[] = [];
  const onUpload = vi.fn((context: FileUploadTaskContext) => {
    contexts.push(context);
    return tasks[contexts.length - 1]!.promise;
  });
  const onUploadComplete = vi.fn();
  const options = { onUpload, onUploadComplete };
  const store = setup([files[0]!], options);
  await flush();
  contexts[0]!.setStage("uploading");
  contexts[0]!.onProgress(100);
  contexts[0]!.setStage("processing");
  expect(store.getSnapshot()[0]!.status).toBe("processing");
  expect(onUploadComplete).not.toHaveBeenCalled();
  store.configure(files.slice(0, 2), options);
  await flush();
  tasks[0]!.resolve("first");
  await flush();
  expect(onUploadComplete).not.toHaveBeenCalled();
  tasks[1]!.resolve("second");
  await flush();
  expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith(["first", "second"]);
  contexts[0]!.setStage("uploading");
  contexts[0]!.onProgress(10);
  expect(store.getSnapshot()[0]!.status).toBe("done");
});

it("does not report success on failure and retries the whole workflow with a fresh signal", async () => {
  const failure = new Error("signature expired");
  const contexts: FileUploadTaskContext[] = [];
  const onUpload = vi.fn(async (context: FileUploadTaskContext) => {
    contexts.push(context);
    if (contexts.length === 1) throw failure;
    return "url";
  });
  const onUploadComplete = vi.fn();
  const onUploadError = vi.fn();
  const store = setup([files[0]!], {
    onUpload,
    onUploadComplete,
    onUploadError,
  });
  await flush();
  const entry = store.getSnapshot()[0]!;
  expect(entry.status).toBe("error");
  expect(onUploadError).toHaveBeenCalledExactlyOnceWith(failure, entry);
  expect(onUploadComplete).not.toHaveBeenCalled();
  store.retry(entry.id);
  await flush();
  expect(contexts[0]!.signal).not.toBe(contexts[1]!.signal);
  expect(store.getSnapshot()[0]!.id).toBe(entry.id);
  expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith(["url"]);
});

it("cancels queued work without calling onUpload and ignores late canceled results", async () => {
  const tasks = [deferred<string>(), deferred<string>()];
  const contexts: FileUploadTaskContext[] = [];
  const onUpload = vi.fn((context: FileUploadTaskContext) => {
    contexts.push(context);
    return tasks[contexts.length - 1]!.promise;
  });
  const onUploadComplete = vi.fn();
  const onUploadError = vi.fn();
  const store = setup(files.slice(0, 2), {
    onUpload,
    onUploadComplete,
    onUploadError,
    concurrency: 1,
  });
  await flush();
  const [first, second] = store.getSnapshot();
  store.cancel(second!.id);
  store.cancel(first!.id);
  await flush();
  expect(onUpload).toHaveBeenCalledTimes(1);
  expect(contexts[0]!.signal.aborted).toBe(true);
  store.retry(first!.id);
  await flush();
  contexts[0]!.setStage("processing");
  contexts[0]!.onProgress(99);
  tasks[0]!.resolve("stale");
  await flush();
  expect(store.getSnapshot()[0]!.status).toBe("preparing");
  tasks[1]!.resolve("fresh");
  await flush();
  expect(store.getSnapshot()[0]!.result).toBe("fresh");
  expect(onUploadComplete).not.toHaveBeenCalled();
  expect(onUploadError).not.toHaveBeenCalled();
});

it("supports manual starts and leaves unstarted tasks incomplete", async () => {
  const onUpload = vi.fn(async ({ file }: FileUploadTaskContext) => file.name);
  const onUploadComplete = vi.fn();
  const store = setup(files.slice(0, 2), {
    onUpload,
    onUploadComplete,
    autoUpload: false,
  });
  await flush();
  expect(onUpload).not.toHaveBeenCalled();
  store.upload(store.getSnapshot()[0]!.id);
  await flush();
  expect(onUpload).toHaveBeenCalledTimes(1);
  expect(onUploadComplete).not.toHaveBeenCalled();
  store.upload();
  await flush();
  expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith(
    files.slice(0, 2).map((file) => file.name),
  );
});

it("aborts removed and replaced files and never revives them from late results", async () => {
  const tasks = [deferred<string>(), deferred<string>()];
  const contexts: FileUploadTaskContext[] = [];
  const onUpload = vi.fn((context: FileUploadTaskContext) => {
    contexts.push(context);
    return tasks[contexts.length - 1]!.promise;
  });
  const onUploadComplete = vi.fn();
  const options = { onUpload, onUploadComplete };
  const store = setup([files[0]!], options);
  await flush();
  store.configure([files[1]!], options);
  await flush();
  expect(contexts[0]!.signal.aborted).toBe(true);
  tasks[0]!.resolve("removed");
  await flush();
  expect(onUploadComplete).not.toHaveBeenCalled();
  tasks[1]!.resolve("replacement");
  await flush();
  expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith(["replacement"]);
  store.configure([], options);
  await flush();
  expect(store.getSnapshot()).toEqual([]);
  expect(onUploadComplete).toHaveBeenCalledTimes(1);
});

it("aborts everything on unmount and handles Strict Mode activation replay", async () => {
  const task = deferred<string>();
  let signal: AbortSignal | undefined;
  const onUpload = vi.fn((context: FileUploadTaskContext) => {
    signal = context.signal;
    return task.promise;
  });
  const onUploadComplete = vi.fn();
  const store = setup(files, { onUpload, onUploadComplete, concurrency: 1 });
  store.deactivate();
  store.activate();
  await flush();
  expect(onUpload).toHaveBeenCalledTimes(1);
  store.deactivate();
  task.resolve("late");
  await flush();
  expect(signal!.aborted).toBe(true);
  expect(onUploadComplete).not.toHaveBeenCalled();
  expect(onUpload).toHaveBeenCalledTimes(1);
});

it("keeps separate identities for duplicate files and preserves IDs on reorder", async () => {
  const onUpload = vi.fn(async () => "url");
  const options = { onUpload, autoUpload: false };
  const store = setup([files[0]!, files[0]!, files[1]!], options);
  await flush();
  const ids = store.getSnapshot().map((entry) => entry.id);
  expect(new Set(ids).size).toBe(3);
  store.configure([files[1]!, files[0]!, files[0]!], options);
  await flush();
  expect(store.getSnapshot().map((entry) => entry.id)).toEqual([
    ids[2],
    ids[0],
    ids[1],
  ]);
});

it("pauses pending work while disabled and applies changed concurrency", async () => {
  const tasks = files.map(() => deferred<string>());
  const onUpload = vi.fn(
    ({ file }: FileUploadTaskContext) => tasks[files.indexOf(file)]!.promise,
  );
  const options = { onUpload, concurrency: 1 };
  const store = setup(files, options);
  await flush();
  store.configure(files, { ...options, disabled: true });
  tasks[0]!.resolve("a");
  await flush();
  store.upload();
  store.retry(store.getSnapshot()[0]!.id);
  expect(onUpload).toHaveBeenCalledTimes(1);
  store.configure(files, { ...options, concurrency: 2 });
  await flush();
  expect(onUpload).toHaveBeenCalledTimes(3);
});

it("does not upload without a handler or complete an empty selection", async () => {
  const onUploadComplete = vi.fn();
  const store = setup(files, { onUploadComplete });
  await flush();
  store.upload();
  await flush();
  expect(store.getSnapshot().every((entry) => entry.status === "idle")).toBe(
    true,
  );
  store.configure([], { onUpload: async () => "url", onUploadComplete });
  await flush();
  expect(onUploadComplete).not.toHaveBeenCalled();
});

it("removes the requested duplicate occurrence without transferring its state", async () => {
  const contexts: FileUploadTaskContext[] = [];
  const tasks = [deferred<string>(), deferred<string>()];
  const onUpload = vi.fn((context: FileUploadTaskContext) => {
    contexts.push(context);
    return tasks[contexts.length - 1]!.promise;
  });
  const onUploadComplete = vi.fn();
  const options = { onUpload, onUploadComplete };
  const store = setup([files[0]!, files[0]!], options);
  await flush();
  const [first, second] = store.getSnapshot();
  store.prepareRemove(first!.id);
  // A controlled parent may render again before accepting the removal.
  store.configure([files[0]!, files[0]!], options);
  await flush();
  expect(store.getSnapshot().map((entry) => entry.id)).toEqual([
    first!.id,
    second!.id,
  ]);
  store.configure([files[0]!], options);
  await flush();
  expect(store.getSnapshot()[0]!.id).toBe(second!.id);
  expect(contexts[0]!.signal.aborted).toBe(true);
  expect(contexts[1]!.signal.aborted).toBe(false);
  tasks[1]!.resolve("remaining");
  await flush();
  expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith(["remaining"]);
});

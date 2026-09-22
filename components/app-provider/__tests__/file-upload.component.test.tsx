import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInstance } from "i18next";
import { StrictMode, createRef, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, expect, it, vi } from "vitest";

import en from "@repo/locales/en/thread-ui.json";
import zh from "@repo/locales/zh/thread-ui.json";
import type { FileUploadHandle } from "../../file-upload";
import type { FileUploadTaskContext } from "../../file-upload/upload-queue";
import type { ReactNode } from "react";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadDropzoneDescription,
  FileUploadItem,
  FileUploadList,
  useFileUpload,
} from "@/components/thread-ui/file-upload";

const file = new File(["report"], 'A&B "<report>".pdf', {
  type: "application/pdf",
});
const otherFile = new File(["notes"], "notes.txt", { type: "text/plain" });

const localized = (children: ReactNode) => {
  const i18n = createInstance();
  void i18n.init({
    initAsync: false,
    lng: "en",
    fallbackLng: "en",
    resources: {
      en: { "thread-ui": structuredClone(en) },
      zh: { "thread-ui": structuredClone(zh) },
    },
  });
  const view = render(
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>,
  );
  return {
    i18n,
    ...view,
    rerender: (children: ReactNode) =>
      view.rerender(<I18nextProvider i18n={i18n}>{children}</I18nextProvider>),
  };
};

const getInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type="file"]')!;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("renders default Attachment items outside the dropzone and localizes removal", async () => {
  const onChange = vi.fn();
  const { container, i18n } = localized(
    <FileUpload
      defaultValue={[file]}
      description="Pick a document"
      title="Attachments"
      onChange={onChange}
    />,
  );
  const dropzone = screen.getByRole("button", {
    name: "Attachments Pick a document",
  });
  const item = screen.getByText(file.name).closest('[data-slot="attachment"]')!;
  expect(item.getAttribute("data-state")).toBe("idle");
  expect(dropzone.contains(item)).toBe(false);
  expect(i18n.options.interpolation?.escapeValue).toBe(true);
  expect(
    screen.getByRole("button", { name: `Remove ${file.name}` }),
  ).toBeTruthy();
  await act(() => i18n.changeLanguage("zh"));
  const inputClick = vi.spyOn(getInput(container), "click");
  await userEvent.click(
    screen.getByRole("button", { name: `移除 ${file.name}` }),
  );
  expect(onChange).toHaveBeenLastCalledWith([]);
  expect(container.querySelector('[data-slot="file-upload-list"]')).toBeNull();
  expect(inputClick).not.toHaveBeenCalled();
});

it("lets children replace both defaults, including an explicit null", () => {
  const { container, rerender } = localized(
    <FileUpload defaultValue={[file]}>
      <FileUploadDropzone>
        <FileUploadDropzoneDescription>
          Custom picker
        </FileUploadDropzoneDescription>
      </FileUploadDropzone>
      <p>Custom attachments</p>
    </FileUpload>,
  );
  expect(screen.getAllByRole("button")).toHaveLength(1);
  expect(screen.getByRole("button", { name: "Custom picker" })).toBeTruthy();
  expect(container.querySelector('[data-slot="file-upload-list"]')).toBeNull();
  rerender(<FileUpload defaultValue={[file]}>{null}</FileUpload>);
  expect(
    container.querySelector('[data-slot="file-upload-root"]')?.childNodes,
  ).toHaveLength(0);
});

it("appends picked, dropped and pasted files in uncontrolled multiple mode", async () => {
  const onChange = vi.fn();
  const { container } = localized(<FileUpload multiple onChange={onChange} />);
  const input = getInput(container);
  await userEvent.upload(input, file);
  expect(input.value).toBe("");
  const dropzone = screen.getByRole("button", {
    name: en.fileUpload.placeholder,
  });
  fireEvent.dragOver(dropzone);
  expect(dropzone.getAttribute("data-dragging")).toBe("true");
  fireEvent.drop(dropzone, { dataTransfer: { files: [otherFile] } });
  expect(dropzone.getAttribute("data-dragging")).toBe("false");
  fireEvent.paste(dropzone, {
    clipboardData: {
      files: [],
      items: [{ kind: "file", getAsFile: () => file }],
    },
  });
  expect(onChange).toHaveBeenLastCalledWith([file, otherFile, file]);
  expect(screen.getAllByRole("button", { name: /^Remove / })).toHaveLength(3);
});

it("replaces files in single mode and keeps controlled state owned by the caller", async () => {
  const onChange = vi.fn();
  const { container } = localized(
    <FileUpload value={[file]} onChange={onChange} />,
  );
  await userEvent.upload(getInput(container), otherFile);
  expect(onChange).toHaveBeenLastCalledWith([otherFile]);
  expect(screen.getByText(file.name)).toBeTruthy();
  expect(screen.queryByText(otherFile.name)).toBeNull();
  await userEvent.click(
    screen.getByRole("button", { name: `Remove ${file.name}` }),
  );
  expect(onChange).toHaveBeenLastCalledWith([]);
  expect(screen.getByText(file.name)).toBeTruthy();
});

it("opens the picker with the keyboard and forwards the accessible name", () => {
  const { container } = localized(<FileUpload aria-label="Add attachments" />);
  const inputClick = vi.spyOn(getInput(container), "click");
  const dropzone = screen.getByRole("button", { name: "Add attachments" });
  fireEvent.keyDown(dropzone, { key: "Enter" });
  fireEvent.keyDown(dropzone, { key: " " });
  expect(inputClick).toHaveBeenCalledTimes(2);
});

it("blocks selection and removal while disabled", async () => {
  const onChange = vi.fn();
  const { container } = localized(
    <FileUpload disabled defaultValue={[file]} onChange={onChange} />,
  );
  const input = getInput(container);
  const inputClick = vi.spyOn(input, "click");
  const dropzone = screen.getByRole("button", {
    name: en.fileUpload.placeholder,
  });
  fireEvent.click(dropzone);
  fireEvent.keyDown(dropzone, { key: "Enter" });
  fireEvent.drop(dropzone, { dataTransfer: { files: [otherFile] } });
  fireEvent.paste(dropzone, { clipboardData: { files: [otherFile] } });
  fireEvent.change(input, { target: { files: [otherFile] } });
  const remove = screen.getByRole("button", {
    name: `Remove ${file.name}`,
  }) as HTMLButtonElement;
  expect(remove.disabled).toBe(true);
  await userEvent.click(remove);
  expect(onChange).not.toHaveBeenCalled();
  expect(inputClick).not.toHaveBeenCalled();
});

const ContextControls = () => {
  const { files, addFiles, removeFile, openFileDialog, isDragging } =
    useFileUpload();
  return (
    <>
      <output aria-label="Selection">
        {files.map((file) => file.name).join(",")}
      </output>
      <output aria-label="Dragging">{String(isDragging)}</output>
      <button type="button" onClick={() => addFiles([otherFile])}>
        Add
      </button>
      <button type="button" onClick={() => removeFile(0)}>
        Remove
      </button>
      <button type="button" onClick={openFileDialog}>
        Browse
      </button>
    </>
  );
};

it("shares state with custom children and opens the picker without a dropzone", async () => {
  const onChange = vi.fn();
  const { container } = localized(
    <FileUpload multiple defaultValue={[file]} onChange={onChange}>
      <ContextControls />
    </FileUpload>,
  );
  const inputClick = vi.spyOn(getInput(container), "click");
  await userEvent.click(screen.getByRole("button", { name: "Browse" }));
  expect(inputClick).toHaveBeenCalledOnce();
  await userEvent.click(screen.getByRole("button", { name: "Add" }));
  expect(screen.getByLabelText("Selection").textContent).toBe(
    `${file.name},${otherFile.name}`,
  );
  expect(onChange).toHaveBeenLastCalledWith([file, otherFile]);
  await userEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect(screen.getByLabelText("Selection").textContent).toBe(otherFile.name);
  expect(onChange).toHaveBeenLastCalledWith([otherFile]);
});

it("shares dragging state and protects context actions when disabled", async () => {
  const onChange = vi.fn();
  const { container, rerender } = localized(
    <FileUpload defaultValue={[file]}>
      <FileUploadDropzone />
      <ContextControls />
    </FileUpload>,
  );
  fireEvent.dragOver(
    screen.getByRole("button", { name: en.fileUpload.placeholder }),
  );
  expect(screen.getByLabelText("Dragging").textContent).toBe("true");
  fireEvent.drop(
    screen.getByRole("button", { name: en.fileUpload.placeholder }),
    { dataTransfer: { files: [] } },
  );
  expect(screen.getByLabelText("Dragging").textContent).toBe("false");
  rerender(
    <FileUpload disabled defaultValue={[file]} onChange={onChange}>
      <ContextControls />
    </FileUpload>,
  );
  const inputClick = vi.spyOn(getInput(container), "click");
  for (const name of ["Add", "Remove", "Browse"]) {
    await userEvent.click(screen.getByRole("button", { name }));
  }
  expect(screen.getByLabelText("Selection").textContent).toBe(file.name);
  expect(onChange).not.toHaveBeenCalled();
  expect(inputClick).not.toHaveBeenCalled();
});

it("uses the controlled value as the context source of truth", async () => {
  const onChange = vi.fn();
  const { rerender } = localized(
    <FileUpload value={[file]} onChange={onChange}>
      <ContextControls />
    </FileUpload>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Add" }));
  expect(onChange).toHaveBeenLastCalledWith([otherFile]);
  expect(screen.getByLabelText("Selection").textContent).toBe(file.name);
  rerender(
    <FileUpload value={[otherFile]} onChange={onChange}>
      <ContextControls />
    </FileUpload>,
  );
  expect(screen.getByLabelText("Selection").textContent).toBe(otherFile.name);
});

it("renders localized upload progress and actions and completes only after confirmation", async () => {
  let context!: FileUploadTaskContext;
  let finish!: (value: { url: string }) => void;
  const onUpload = vi.fn((next: FileUploadTaskContext) => {
    context = next;
    return new Promise<{ url: string }>((resolve) => {
      finish = resolve;
    });
  });
  const onUploadComplete = vi.fn();
  const { i18n } = localized(
    <StrictMode>
      <FileUpload
        defaultValue={[file]}
        onUpload={onUpload}
        onUploadComplete={onUploadComplete}
      />
    </StrictMode>,
  );
  await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
  expect(context.file).toBe(file);
  expect(screen.getByRole("status").textContent).toBe("Uploading");
  await act(async () => {
    context.onProgress(42);
  });
  expect(screen.getByRole("status").textContent).toBe("Uploading 42%");
  await act(() => i18n.changeLanguage("zh"));
  expect(screen.getByRole("status").textContent).toBe("上传中 42%");
  expect(
    screen.getByRole("button", { name: `取消上传 ${file.name}` }),
  ).toBeTruthy();
  await act(async () => {
    context.onProgress(100);
  });
  expect(screen.getByRole("status").textContent).toBe("上传中 100%");
  expect(onUploadComplete).not.toHaveBeenCalled();
  await act(async () => finish({ url: "https://example.com/report.pdf" }));
  expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith([
    { url: "https://example.com/report.pdf" },
  ]);
  expect(screen.getByRole("status").textContent).toBe("已上传");
});

it("starts and retries from default Attachment actions", async () => {
  const onUpload = vi
    .fn()
    .mockRejectedValueOnce(new Error("expired"))
    .mockResolvedValueOnce({ url: "url" });
  const onUploadComplete = vi.fn();
  localized(
    <FileUpload
      autoUpload={false}
      defaultValue={[file]}
      onUpload={onUpload}
      onUploadComplete={onUploadComplete}
    />,
  );
  expect(onUpload).not.toHaveBeenCalled();
  await userEvent.click(
    screen.getByRole("button", { name: `Upload ${file.name}` }),
  );
  expect(screen.getByRole("status").textContent).toBe("Upload failed");
  expect(onUploadComplete).not.toHaveBeenCalled();
  await userEvent.click(
    screen.getByRole("button", { name: `Retry upload of ${file.name}` }),
  );
  expect(onUpload).toHaveBeenCalledTimes(2);
  expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith([{ url: "url" }]);
});

it("aborts a removed controlled file and does not complete from its late result", async () => {
  let context!: FileUploadTaskContext;
  let finish!: (value: string) => void;
  const onUpload = vi.fn((next: FileUploadTaskContext) => {
    context = next;
    return new Promise<string>((resolve) => {
      finish = resolve;
    });
  });
  const onUploadComplete = vi.fn();
  const { rerender } = localized(
    <FileUpload
      value={[file]}
      onUpload={onUpload}
      onUploadComplete={onUploadComplete}
    />,
  );
  await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
  rerender(
    <FileUpload
      value={[]}
      onUpload={onUpload}
      onUploadComplete={onUploadComplete}
    />,
  );
  expect(context.signal.aborted).toBe(true);
  await act(async () => finish("stale"));
  expect(onUploadComplete).not.toHaveBeenCalled();
  expect(screen.queryByText(file.name)).toBeNull();
});

const BatchControls = ({
  action,
}: {
  action: (context: ReturnType<typeof useFileUpload>) => void;
}) => {
  const context = useFileUpload();
  return (
    <>
      <output aria-label="Batch files">
        {context.files.map((file) => file.name).join(",")}
      </output>
      <output aria-label="Batch tasks">
        {context.entries
          .map((entry) => `${entry.id}:${entry.status}`)
          .join(",")}
      </output>
      <button type="button" onClick={() => action(context)}>
        Batch action
      </button>
    </>
  );
};

const ControlledBatchUpload = ({
  action,
  onChange,
  initialFiles = [],
}: {
  action: (context: ReturnType<typeof useFileUpload>) => void;
  onChange: (files: File[]) => void;
  initialFiles?: File[];
}) => {
  const [files, setFiles] = useState(initialFiles);
  return (
    <FileUpload
      multiple
      value={files}
      onChange={(next) => {
        onChange(next);
        setFiles(next);
      }}
    >
      <BatchControls action={action} />
    </FileUpload>
  );
};

it.each([false, true])(
  "accumulates batched additions without duplicate notifications in Strict Mode (controlled=%s)",
  (controlled) => {
    const onChange = vi.fn();
    const action = ({ addFiles }: ReturnType<typeof useFileUpload>) => {
      addFiles([file]);
      addFiles([otherFile]);
    };
    localized(
      <StrictMode>
        {controlled ? (
          <ControlledBatchUpload action={action} onChange={onChange} />
        ) : (
          <FileUpload multiple onChange={onChange}>
            <BatchControls action={action} />
          </FileUpload>
        )}
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Batch action" }));
    expect(screen.getByLabelText("Batch files").textContent).toBe(
      `${file.name},${otherFile.name}`,
    );
    expect(onChange.mock.calls).toEqual([[[file]], [[file, otherFile]]]);
  },
);

it.each([false, true])(
  "removes every task by ID in one batch, including duplicate files (controlled=%s)",
  (controlled) => {
    const onChange = vi.fn();
    const initialFiles = [file, file, otherFile];
    const action = ({ entries, remove }: ReturnType<typeof useFileUpload>) =>
      entries.forEach((entry) => remove(entry.id));
    localized(
      controlled ? (
        <ControlledBatchUpload
          action={action}
          initialFiles={initialFiles}
          onChange={onChange}
        />
      ) : (
        <FileUpload multiple defaultValue={initialFiles} onChange={onChange}>
          <BatchControls action={action} />
        </FileUpload>
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Batch action" }));
    expect(screen.getByLabelText("Batch files").textContent).toBe("");
    expect(screen.getByLabelText("Batch tasks").textContent).toBe("");
    expect(onChange.mock.calls).toEqual([
      [[file, otherFile]],
      [[otherFile]],
      [[]],
    ]);
  },
);

it("aborts all tasks removed in a batch and ignores their late results", async () => {
  const contexts: FileUploadTaskContext[] = [];
  const finish: ((result: string) => void)[] = [];
  const onUpload = vi.fn((context: FileUploadTaskContext) => {
    contexts.push(context);
    return new Promise<string>((resolve) => {
      finish.push(resolve);
    });
  });
  const onUploadComplete = vi.fn();
  localized(
    <FileUpload
      multiple
      defaultValue={[file, file, otherFile]}
      onUpload={onUpload}
      onUploadComplete={onUploadComplete}
    >
      <BatchControls
        action={({ entries, remove }) =>
          entries.forEach((entry) => remove(entry.id))
        }
      />
    </FileUpload>,
  );
  await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(3));
  fireEvent.click(screen.getByRole("button", { name: "Batch action" }));
  expect(contexts.every(({ signal }) => signal.aborted)).toBe(true);
  await act(async () => {
    finish.forEach((resolve) => resolve("stale"));
  });
  expect(screen.getByLabelText("Batch files").textContent).toBe("");
  expect(screen.getByLabelText("Batch tasks").textContent).toBe("");
  expect(onUploadComplete).not.toHaveBeenCalled();
});

it("applies mixed add/remove actions against the latest draft and ignores repeated removal of an ID", () => {
  const onChange = vi.fn();
  localized(
    <FileUpload multiple defaultValue={[file]} onChange={onChange}>
      <BatchControls
        action={({ entries, addFiles, remove, removeFile }) => {
          addFiles([otherFile]);
          remove(entries[0]!.id);
          remove(entries[0]!.id);
          removeFile(0);
          addFiles([file]);
        }}
      />
    </FileUpload>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Batch action" }));
  expect(screen.getByLabelText("Batch files").textContent).toBe(file.name);
  expect(onChange.mock.calls).toEqual([
    [[file, otherFile]],
    [[otherFile]],
    [[]],
    [[file]],
  ]);
});

it("resets the draft to a controlled value when changes are rejected without a parent render", async () => {
  const onChange = vi.fn();
  localized(
    <FileUpload multiple value={[]} onChange={onChange}>
      <BatchControls
        action={({ addFiles }) => {
          addFiles([file]);
          addFiles([otherFile]);
        }}
      />
    </FileUpload>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Batch action" }));
  await userEvent.click(screen.getByRole("button", { name: "Batch action" }));
  expect(screen.getByLabelText("Batch files").textContent).toBe("");
  expect(onChange.mock.calls).toEqual([
    [[file]],
    [[file, otherFile]],
    [[file]],
    [[file, otherFile]],
  ]);
});

it.each(["uncontrolled", "controlled", "copied"] as const)(
  "creates a fresh task when removing and re-adding the same File in one batch (%s)",
  async (mode) => {
    const contexts: FileUploadTaskContext[] = [];
    const finish: ((result: string) => void)[] = [];
    const onUpload = vi.fn((context: FileUploadTaskContext) => {
      contexts.push(context);
      return new Promise<string>((resolve) => {
        finish.push(resolve);
      });
    });
    const onUploadComplete = vi.fn();
    function Example() {
      const [files, setFiles] = useState([file]);
      return (
        <FileUpload
          multiple
          defaultValue={[file]}
          value={mode === "uncontrolled" ? undefined : files}
          onChange={(next) => setFiles(mode === "copied" ? [...next] : next)}
          onUpload={onUpload}
          onUploadComplete={onUploadComplete}
        >
          <BatchControls
            action={({ entries, remove, addFiles }) => {
              remove(entries[0]!.id);
              addFiles([file]);
            }}
          />
        </FileUpload>
      );
    }
    localized(<Example />);
    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
    const originalTask = screen.getByLabelText("Batch tasks").textContent;
    fireEvent.click(screen.getByRole("button", { name: "Batch action" }));
    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(2));
    expect(screen.getByLabelText("Batch tasks").textContent).not.toBe(
      originalTask,
    );
    expect(contexts[0]!.signal.aborted).toBe(true);
    expect(contexts[1]!.signal.aborted).toBe(false);
    await act(async () => {
      finish[0]!("old");
      finish[1]!("new");
    });
    expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith(["new"]);
  },
);

it("starts props-mode uploads through an external ref and preserves the native picker", async () => {
  const ref = createRef<FileUploadHandle<{ url: string }>>();
  const onUpload = vi.fn(async ({ file }: FileUploadTaskContext) => ({
    url: `/files/${file.name}`,
  }));
  const onUploadComplete = vi.fn();
  const { container, unmount } = localized(
    <StrictMode>
      <FileUpload
        ref={ref}
        multiple
        autoUpload={false}
        onUpload={onUpload}
        onUploadComplete={onUploadComplete}
      />
      <button type="button" onClick={() => ref.current?.upload()}>
        Upload all
      </button>
    </StrictMode>,
  );
  const input = getInput(container);
  const inputClick = vi.spyOn(input, "click");
  await userEvent.click(
    screen.getByRole("button", { name: en.fileUpload.placeholder }),
  );
  expect(inputClick).toHaveBeenCalledOnce();
  act(() => ref.current!.openFileDialog());
  expect(inputClick).toHaveBeenCalledTimes(2);
  await userEvent.upload(input, [file, otherFile]);
  expect(screen.getAllByRole("button", { name: /^Remove / })).toHaveLength(2);
  expect(onUpload).not.toHaveBeenCalled();
  expect(ref.current!.getEntries().map((entry) => entry.status)).toEqual([
    "idle",
    "idle",
  ]);
  await userEvent.click(screen.getByRole("button", { name: "Upload all" }));
  expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith([
    { url: `/files/${file.name}` },
    { url: `/files/${otherFile.name}` },
  ]);
  expect(ref.current!.getEntries()[0]!.result?.url).toBe(`/files/${file.name}`);
  unmount();
  expect(ref.current).toBeNull();
});

it("reads fresh task snapshots and supports cancel, retry and remove through the ref", async () => {
  const ref = createRef<FileUploadHandle<string>>();
  const contexts: FileUploadTaskContext[] = [];
  const finish: ((result: string) => void)[] = [];
  const onUpload = vi.fn((context: FileUploadTaskContext) => {
    contexts.push(context);
    return new Promise<string>((resolve) => {
      finish.push(resolve);
    });
  });
  const onUploadComplete = vi.fn();
  localized(
    <FileUpload
      ref={ref}
      autoUpload={false}
      defaultValue={[file]}
      onUpload={onUpload}
      onUploadComplete={onUploadComplete}
    />,
  );
  const getEntries = ref.current!.getEntries;
  const id = getEntries()[0]!.id;
  await act(async () => ref.current!.upload(id));
  await act(async () => {
    contexts[0]!.onProgress(35);
  });
  expect(getEntries()[0]!.progress).toBe(35);
  await act(async () => ref.current!.cancel(id));
  expect(contexts[0]!.signal.aborted).toBe(true);
  expect(getEntries()[0]!.status).toBe("canceled");
  await act(async () => ref.current!.retry(id));
  expect(onUpload).toHaveBeenCalledTimes(2);
  await act(async () => {
    finish[0]!("stale");
    finish[1]!("current");
  });
  expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith(["current"]);
  act(() => ref.current!.remove(id));
  expect(getEntries()).toEqual([]);
  expect(screen.queryByText(file.name)).toBeNull();
});

it("respects updated disabled and controlled props through the ref", async () => {
  const ref = createRef<FileUploadHandle<string>>();
  const onUpload = vi.fn(async () => "url");
  const onChange = vi.fn();
  const props = { ref, autoUpload: false, value: [file], onUpload, onChange };
  const { container, rerender } = localized(<FileUpload {...props} />);
  const id = ref.current!.getEntries()[0]!.id;
  rerender(<FileUpload {...props} disabled />);
  const inputClick = vi.spyOn(getInput(container), "click");
  await act(async () => {
    ref.current!.upload();
    ref.current!.cancel(id);
    ref.current!.retry(id);
    ref.current!.remove(id);
    ref.current!.openFileDialog();
  });
  expect(onUpload).not.toHaveBeenCalled();
  expect(onChange).not.toHaveBeenCalled();
  expect(inputClick).not.toHaveBeenCalled();
  expect(ref.current!.getEntries()[0]!.status).toBe("idle");
  rerender(<FileUpload {...props} />);
  act(() => ref.current!.remove(id));
  expect(onChange).toHaveBeenCalledExactlyOnceWith([]);
  expect(ref.current!.getEntries()).toHaveLength(1);
  rerender(<FileUpload {...props} value={[]} />);
  expect(ref.current!.getEntries()).toEqual([]);
});

it("supports callback refs in composition mode and clears the handle on unmount", async () => {
  const ref = vi.fn();
  const onUpload = vi.fn(async () => "url");
  const { unmount } = localized(
    <FileUpload
      ref={ref}
      autoUpload={false}
      defaultValue={[file]}
      onUpload={onUpload}
    >
      <FileUploadDropzone>Custom picker</FileUploadDropzone>
    </FileUpload>,
  );
  const handle = ref.mock.lastCall![0] as FileUploadHandle<string>;
  await act(async () => handle.upload());
  expect(onUpload).toHaveBeenCalledTimes(1);
  expect(handle.getEntries()[0]!.result).toBe("url");
  expect(screen.queryByText(file.name)).toBeNull();
  unmount();
  expect(ref.mock.lastCall![0]).toBeNull();
});

it("shows image thumbnails in props mode and releases their URLs on removal and unmount", async () => {
  const createObjectURL = vi.fn((file: File) => `blob:${file.name}`);
  const revokeObjectURL = vi.fn();
  vi.stubGlobal(
    "URL",
    class extends URL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = revokeObjectURL;
    },
  );
  const photo = new File(["photo"], "photo.png", { type: "image/png" });
  const secondPhoto = new File(["photo"], "second.jpg", { type: "image/jpeg" });
  const { unmount } = localized(
    <FileUpload multiple defaultValue={[photo, secondPhoto, file]} />,
  );
  const image = await screen.findByRole("img", { name: photo.name });
  expect(image.getAttribute("src")).toBe(`blob:${photo.name}`);
  expect(
    image
      .closest('[data-slot="attachment-media"]')
      ?.getAttribute("data-variant"),
  ).toBe("image");
  expect(
    image.closest('[data-slot="attachment"]')?.getAttribute("data-orientation"),
  ).toBe("horizontal");
  expect(
    createObjectURL.mock.calls.every(([file]) =>
      file.type.startsWith("image/"),
    ),
  ).toBe(true);
  await userEvent.click(
    screen.getByRole("button", { name: `Remove ${photo.name}` }),
  );
  expect(screen.queryByRole("img", { name: photo.name })).toBeNull();
  expect(revokeObjectURL).toHaveBeenCalledWith(`blob:${photo.name}`);
  expect(screen.getByRole("img", { name: secondPhoto.name })).toBeTruthy();
  unmount();
  expect(revokeObjectURL).toHaveBeenCalledWith(`blob:${secondPhoto.name}`);
});

it.each(["uncontrolled", "controlled", "copied"] as const)(
  "uploads the selection made in the same handler (%s)",
  async (mode) => {
    const onUpload = vi.fn(
      async ({ file }: FileUploadTaskContext) => file.name,
    );
    const onUploadComplete = vi.fn();
    function Example() {
      const [files, setFiles] = useState<File[]>([]);
      return (
        <FileUpload
          multiple
          autoUpload={false}
          value={mode === "uncontrolled" ? undefined : files}
          onChange={(next) => setFiles(mode === "copied" ? [...next] : next)}
          onUpload={onUpload}
          onUploadComplete={onUploadComplete}
        >
          <BatchControls
            action={({ addFiles, upload }) => {
              addFiles([file]);
              addFiles([otherFile]);
              upload();
            }}
          />
        </FileUpload>
      );
    }
    localized(
      <StrictMode>
        <Example />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Batch action" }));
    await waitFor(() =>
      expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith([
        file.name,
        otherFile.name,
      ]),
    );
    expect(onUpload).toHaveBeenCalledTimes(2);
  },
);

it("lets an external ref start newly selected props-mode files from onChange", async () => {
  const ref = createRef<FileUploadHandle<string>>();
  const onUpload = vi.fn(async ({ file }: FileUploadTaskContext) => file.name);
  const { container } = localized(
    <FileUpload
      ref={ref}
      autoUpload={false}
      onChange={() => ref.current!.upload()}
      onUpload={onUpload}
    />,
  );
  fireEvent.change(getInput(container), { target: { files: [file] } });
  await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
  expect(onUpload.mock.calls[0]![0].file).toBe(file);
});

it("does not extend a manual upload request to files added later in the batch", async () => {
  const onUpload = vi.fn(async ({ file }: FileUploadTaskContext) => file.name);
  const ref = createRef<FileUploadHandle<string>>();
  const onUploadComplete = vi.fn();
  localized(
    <FileUpload
      ref={ref}
      multiple
      autoUpload={false}
      onUpload={onUpload}
      onUploadComplete={onUploadComplete}
    >
      <BatchControls
        action={({ addFiles, upload }) => {
          addFiles([file]);
          upload();
          addFiles([otherFile]);
        }}
      />
    </FileUpload>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Batch action" }));
  await waitFor(() =>
    expect(ref.current!.getEntries().map((entry) => entry.status)).toEqual([
      "done",
      "idle",
    ]),
  );
  expect(onUpload).toHaveBeenCalledTimes(1);
  expect(onUploadComplete).not.toHaveBeenCalled();
  await act(async () => ref.current!.upload());
  expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith([
    file.name,
    otherFile.name,
  ]);
});

it("discards upload requests for files removed before the selection commits", async () => {
  const onUpload = vi.fn(async () => "url");
  const ref = createRef<FileUploadHandle<string>>();
  localized(
    <FileUpload ref={ref} multiple autoUpload={false} onUpload={onUpload}>
      <BatchControls
        action={({ addFiles, upload, removeFile }) => {
          addFiles([file]);
          upload();
          removeFile(0);
          addFiles([file]);
        }}
      />
    </FileUpload>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Batch action" }));
  await act(async () => {});
  expect(onUpload).not.toHaveBeenCalled();
  expect(ref.current!.getEntries().map((entry) => entry.status)).toEqual([
    "idle",
  ]);
  await act(async () => ref.current!.upload());
  expect(onUpload).toHaveBeenCalledTimes(1);
});

it("discards a rejected controlled draft and its upload request without requiring a parent render", async () => {
  const onUpload = vi.fn(async () => "url");
  const onChange = vi.fn();
  const ref = createRef<FileUploadHandle<string>>();
  const props = { ref, multiple: true, autoUpload: false, onUpload, onChange };
  const controls = (
    <BatchControls
      action={({ addFiles, upload }) => {
        addFiles([file]);
        upload();
      }}
    />
  );
  const { rerender } = localized(
    <FileUpload {...props} value={[]}>
      {controls}
    </FileUpload>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Batch action" }));
  await act(async () => {});
  expect(ref.current!.getEntries()).toEqual([]);
  expect(onUpload).not.toHaveBeenCalled();
  // An independent later selection of the same File must not inherit the request.
  rerender(
    <FileUpload {...props} value={[file]}>
      {controls}
    </FileUpload>,
  );
  await act(async () => {});
  expect(ref.current!.getEntries()[0]!.status).toBe("idle");
  expect(onUpload).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Batch action" }));
  await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
  expect(onChange.mock.calls).toEqual([[[file]], [[file, file]]]);
});

it.each([false, true])(
  "preserves duplicate identities when a controlled parent copies and optionally reorders a replacement (reorder=%s)",
  async (reorder) => {
    const ref = createRef<FileUploadHandle<string>>();
    const contexts: FileUploadTaskContext[] = [];
    const finish: ((result: string) => void)[] = [];
    const onUpload = vi.fn((context: FileUploadTaskContext) => {
      contexts.push(context);
      return new Promise<string>((resolve) => finish.push(resolve));
    });
    const onUploadComplete = vi.fn();
    function Example() {
      const [files, setFiles] = useState([file, otherFile, file]);
      return (
        <FileUpload
          ref={ref}
          multiple
          value={files}
          onUpload={onUpload}
          onUploadComplete={onUploadComplete}
          onChange={(next) =>
            setFiles(reorder ? [...next].reverse() : [...next])
          }
        >
          <BatchControls
            action={({ entries, remove, addFiles }) => {
              remove(entries[0]!.id);
              addFiles([file]);
            }}
          />
        </FileUpload>
      );
    }
    localized(<Example />);
    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(3));
    const [removed, other, retained] = ref.current!.getEntries();
    fireEvent.click(screen.getByRole("button", { name: "Batch action" }));
    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(4));
    const entries = ref.current!.getEntries();
    expect(entries.some((entry) => entry.id === removed!.id)).toBe(false);
    expect(entries.some((entry) => entry.id === retained!.id)).toBe(true);
    expect(entries.some((entry) => entry.id === other!.id)).toBe(true);
    expect(contexts.map((context) => context.signal.aborted)).toEqual([
      true,
      false,
      false,
      false,
    ]);
    await act(async () =>
      finish.forEach((resolve, index) => resolve(String(index))),
    );
    // Duplicate File occurrences retain their relative identity after reordering.
    expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith(
      reorder ? ["2", "3", "1"] : ["1", "2", "3"],
    );
  },
);

it("keeps a rejected same-file replacement canceled instead of treating a queue render as acceptance", async () => {
  const ref = createRef<FileUploadHandle<string>>();
  const onUpload = vi.fn(() => new Promise<string>(() => {}));
  const value = [file];
  localized(
    <FileUpload
      ref={ref}
      multiple
      value={value}
      onChange={() => {}}
      onUpload={onUpload}
    >
      <BatchControls
        action={({ entries, remove, addFiles }) => {
          remove(entries[0]!.id);
          addFiles([file]);
        }}
      />
    </FileUpload>,
  );
  await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
  const id = ref.current!.getEntries()[0]!.id;
  fireEvent.click(screen.getByRole("button", { name: "Batch action" }));
  await act(async () => {});
  expect(ref.current!.getEntries()[0]).toMatchObject({
    id,
    status: "canceled",
  });
  expect(onUpload).toHaveBeenCalledTimes(1);
});

it.each(["default", "custom"])(
  "binds duplicate file statuses and actions to task IDs in %s layouts",
  async (layout) => {
    const ref = createRef<FileUploadHandle<string>>();
    const tasks: {
      context: FileUploadTaskContext;
      resolve: (value: string) => void;
    }[] = [];
    const onUpload = vi.fn(
      (context: FileUploadTaskContext) =>
        new Promise<string>((resolve) => tasks.push({ context, resolve })),
    );
    const onUploadComplete = vi.fn();
    function Items() {
      const { entries } = useFileUpload();
      const [reversed, setReversed] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setReversed(!reversed)}>
            Reverse rows
          </button>
          {(reversed ? [...entries].reverse() : entries).map((entry) => (
            <FileUploadItem
              key={entry.id}
              data-testid={entry.id}
              entryId={entry.id}
            />
          ))}
        </>
      );
    }
    const { container } = localized(
      <FileUpload
        ref={ref}
        multiple
        autoUpload={false}
        defaultValue={[file, file]}
        onUpload={onUpload}
        onUploadComplete={onUploadComplete}
      >
        {layout === "custom" ? <Items /> : <FileUploadList />}
      </FileUpload>,
    );
    const [first, second] = ref.current!.getEntries();
    const row = (id: string) =>
      layout === "custom"
        ? screen.getByTestId(id)
        : container.querySelectorAll<HTMLElement>(
            '[data-slot="file-upload-item"]',
          )[ref.current!.getEntries().findIndex((entry) => entry.id === id)]!;
    const action = (id: string, name: string) =>
      within(row(id)).getByRole("button", { name });
    await userEvent.click(action(second!.id, `Upload ${file.name}`));
    await act(async () => tasks[0]!.context.onProgress(37));
    expect(within(row(first!.id)).getByRole("status").textContent).toBe(
      "Waiting to upload",
    );
    expect(within(row(second!.id)).getByRole("status").textContent).toBe(
      "Uploading 37%",
    );
    if (layout === "custom") {
      await userEvent.click(
        screen.getByRole("button", { name: "Reverse rows" }),
      );
      expect(
        container
          .querySelector('[data-slot="file-upload-item"]')
          ?.getAttribute("data-testid"),
      ).toBe(second!.id);
    }
    await userEvent.click(action(second!.id, `Cancel upload of ${file.name}`));
    expect(tasks[0]!.context.signal.aborted).toBe(true);
    expect(ref.current!.getEntries().map((entry) => entry.status)).toEqual([
      "idle",
      "canceled",
    ]);
    await userEvent.click(action(second!.id, `Retry upload of ${file.name}`));
    await userEvent.click(action(first!.id, `Upload ${file.name}`));
    expect(onUpload).toHaveBeenCalledTimes(3);
    await act(async () => {
      tasks[1]!.context.onProgress(64);
      tasks[2]!.context.onProgress(12);
    });
    expect(within(row(first!.id)).getByRole("status").textContent).toBe(
      "Uploading 12%",
    );
    expect(within(row(second!.id)).getByRole("status").textContent).toBe(
      "Uploading 64%",
    );
    await userEvent.click(action(second!.id, `Remove ${file.name}`));
    expect(ref.current!.getEntries().map((entry) => entry.id)).toEqual([
      first!.id,
    ]);
    expect(tasks[1]!.context.signal.aborted).toBe(true);
    expect(tasks[2]!.context.signal.aborted).toBe(false);
    await act(async () => {
      tasks[0]!.resolve("canceled");
      tasks[1]!.resolve("removed");
      tasks[2]!.resolve("retained");
    });
    expect(within(row(first!.id)).getByRole("status").textContent).toBe(
      "Uploaded",
    );
    expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith(["retained"]);
  },
);

it("does not rebind a removed explicit task ID to a duplicate file or inherited list item", async () => {
  const ref = createRef<FileUploadHandle<string>>();
  function Items() {
    const { entries } = useFileUpload();
    const [selectedId, setSelectedId] = useState<string>();
    return (
      <>
        <button type="button" onClick={() => setSelectedId(entries[1]!.id)}>
          Select second task
        </button>
        {selectedId && (
          <FileUploadList>
            <FileUploadItem entryId={selectedId} file={otherFile} />
          </FileUploadList>
        )}
      </>
    );
  }
  const { container } = localized(
    <FileUpload
      ref={ref}
      multiple
      autoUpload={false}
      defaultValue={[file, file]}
      onUpload={async () => "url"}
    >
      <Items />
    </FileUpload>,
  );
  const [first, second] = ref.current!.getEntries();
  await userEvent.click(
    screen.getByRole("button", { name: "Select second task" }),
  );
  await act(async () => ref.current!.cancel(second!.id));
  expect(screen.getAllByRole("status").map((el) => el.textContent)).toEqual([
    "Canceled",
    "Canceled",
  ]);
  expect(screen.queryByText(otherFile.name)).toBeNull();
  await userEvent.click(
    screen.getAllByRole("button", { name: `Remove ${file.name}` })[0]!,
  );
  expect(ref.current!.getEntries().map((entry) => entry.id)).toEqual([
    first!.id,
  ]);
  expect(container.querySelector('[data-slot="file-upload-item"]')).toBeNull();
});

it("rejects ambiguous file-only task bindings instead of selecting the first task", () => {
  expect(() =>
    localized(
      <FileUpload multiple defaultValue={[file, file]}>
        <FileUploadItem file={file} />
      </FileUpload>,
    ),
  ).toThrow(
    "FileUploadItem matches multiple tasks. Pass entryId to identify the task.",
  );
});

it("keeps unique file-only bindings and allows overriding removal", async () => {
  const onRemove = vi.fn();
  const ref = createRef<FileUploadHandle<string>>();
  localized(
    <FileUpload
      ref={ref}
      autoUpload={false}
      defaultValue={[file]}
      onUpload={async () => "url"}
    >
      <FileUploadItem file={file} onRemove={onRemove} />
    </FileUpload>,
  );
  await userEvent.click(
    screen.getByRole("button", { name: `Upload ${file.name}` }),
  );
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe("Uploaded"),
  );
  await userEvent.click(
    screen.getByRole("button", { name: `Remove ${file.name}` }),
  );
  expect(onRemove).toHaveBeenCalledOnce();
  expect(ref.current!.getEntries()).toHaveLength(1);
});

it("falls back after an image decode failure without changing upload state and recovers for a new file", async () => {
  const createObjectURL = vi.fn((file: File) => `blob:${file.name}`);
  const revokeObjectURL = vi.fn();
  vi.stubGlobal(
    "URL",
    class extends URL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = revokeObjectURL;
    },
  );
  const broken = new File(["invalid image"], "broken.png", {
    type: "image/png",
  });
  const next = new File(["new image"], "next.png", { type: "image/png" });
  const ref = createRef<FileUploadHandle<string>>();
  const props = { ref, autoUpload: false, onUpload: async () => "url" };
  const renderItem = (file: File) => (
    <FileUpload {...props} value={[file]}>
      <FileUploadItem file={file} />
    </FileUpload>
  );
  const { container, rerender, unmount } = localized(renderItem(broken));
  fireEvent.error(await screen.findByRole("img", { name: broken.name }));
  expect(screen.queryByRole("img", { name: broken.name })).toBeNull();
  const media = container.querySelector('[data-slot="attachment-media"]')!;
  expect(media.getAttribute("data-variant")).toBe("icon");
  expect(media.querySelector("svg")).toBeTruthy();
  expect(screen.getByText(broken.name)).toBeTruthy();
  expect(ref.current!.getEntries()[0]!.status).toBe("idle");
  await userEvent.click(
    screen.getByRole("button", { name: `Upload ${broken.name}` }),
  );
  expect(ref.current!.getEntries()[0]!.status).toBe("done");
  expect(screen.queryByRole("img")).toBeNull();
  rerender(renderItem(next));
  const image = await screen.findByRole("img", { name: next.name });
  expect(image.getAttribute("src")).toBe(`blob:${next.name}`);
  expect(revokeObjectURL).toHaveBeenCalledWith(`blob:${broken.name}`);
  unmount();
  expect(revokeObjectURL).toHaveBeenCalledWith(`blob:${next.name}`);
});

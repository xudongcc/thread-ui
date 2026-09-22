"use client";

import {
  BanIcon,
  CloudUploadIcon,
  PlayIcon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { FileUploadFileIcon } from "./file-icon";
import { useUploadQueue } from "./use-upload-queue";
import type {
  ClipboardEvent,
  ComponentProps,
  DragEvent,
  FC,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  Ref,
} from "react";

import type { FileUploadEntry, FileUploadOptions } from "./upload-queue";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { cn } from "@/lib/utils";

export type {
  FileUploadEntry,
  FileUploadOptions,
  FileUploadStatus,
  FileUploadTaskContext,
} from "./upload-queue";

type FileUploadInputProps = Omit<
  ComponentProps<"input">,
  | "children"
  | "className"
  | "defaultValue"
  | "onChange"
  | "placeholder"
  | "ref"
  | "title"
  | "type"
  | "value"
>;

export interface FileUploadProps<TResult = unknown>
  extends FileUploadInputProps, FileUploadOptions<TResult> {
  /** Imperative actions for external controls, including in props mode. */
  ref?: Ref<FileUploadHandle<TResult>>;
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  /** Heading in the default dropzone; defaults to the localized "Upload files". */
  title?: ReactNode;
  /** Default dropzone description; falls back to placeholder. */
  description?: ReactNode;
  /** Text shown in the dropzone when description is not provided. */
  placeholder?: string;
  className?: string;
  children?: ReactNode;
}

export interface FileUploadHandle<TResult = unknown> {
  upload: (id?: string) => void;
  retry: (id: string) => void;
  cancel: (id: string) => void;
  remove: (id: string) => void;
  openFileDialog: () => void;
  /** Read current tasks on demand; this getter does not subscribe to changes. */
  getEntries: () => FileUploadEntry<TResult>[];
}

type FileUploadContextValue = {
  files: File[];
  entries: FileUploadEntry[];
  upload: (id?: string) => void;
  retry: (id: string) => void;
  cancel: (id: string) => void;
  remove: (id: string) => void;
  uploadEnabled: boolean;
  inputProps: FileUploadInputProps;
  multiple?: boolean;
  disabled?: boolean;
  placeholder: string;
  title?: ReactNode;
  description?: ReactNode;
  ariaDescribedBy?: string;
  ariaInvalid?: ComponentProps<"input">["aria-invalid"];
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  openFileDialog: () => void;
};

type FileUploadItemContextValue = {
  file: File;
  index: number;
  entry?: FileUploadEntry;
  remove: () => void;
};

type ObjectUrlState = {
  file: File;
  url: string;
};

const imageExtensions = new Set([
  "avif",
  "bmp",
  "gif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "webp",
]);

const FileUploadContext = createContext<FileUploadContextValue | null>(null);
const FileUploadItemContext = createContext<FileUploadItemContextValue | null>(
  null,
);

const useFileUploadContext = () => {
  const context = useContext(FileUploadContext);

  if (!context) {
    throw new Error("FileUpload components must be used within FileUpload.");
  }

  return context;
};

export type UseFileUploadReturn<TResult = unknown> = Pick<
  FileUploadContextValue,
  | "files"
  | "multiple"
  | "disabled"
  | "isDragging"
  | "addFiles"
  | "removeFile"
  | "openFileDialog"
  | "upload"
  | "retry"
  | "cancel"
  | "remove"
> & { entries: FileUploadEntry<TResult>[] };

/** TResult should match the enclosing FileUpload's onUpload return type. */
export const useFileUpload = <
  TResult = unknown,
>(): UseFileUploadReturn<TResult> => {
  const {
    files,
    entries,
    multiple,
    disabled,
    isDragging,
    addFiles,
    removeFile,
    openFileDialog,
    upload,
    retry,
    cancel,
    remove,
  } = useFileUploadContext();
  return {
    files,
    entries: entries as FileUploadEntry<TResult>[],
    multiple,
    disabled,
    isDragging,
    addFiles,
    removeFile,
    openFileDialog,
    upload,
    retry,
    cancel,
    remove,
  };
};

const getClipboardFiles = (event: ClipboardEvent<HTMLDivElement>) => {
  const files = Array.from(event.clipboardData.files);

  if (files.length) {
    return files;
  }

  return Array.from(event.clipboardData.items)
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => !!file);
};

const getFileKey = (file: File, index: number) =>
  `${file.name}-${file.lastModified}-${file.size}-${index}`;

const isImageFile = (file: File) => {
  if (file.type.startsWith("image/")) return true;
  if (file.type.startsWith("video/")) return false;

  const extension = file.name.split(".").pop()?.toLowerCase();
  return !!extension && imageExtensions.has(extension);
};

const useObjectUrl = (file?: File) => {
  const [objectUrlState, setObjectUrlState] = useState<ObjectUrlState>();

  useEffect(() => {
    let isActive = true;

    if (!file) {
      queueMicrotask(() => {
        if (isActive) {
          setObjectUrlState(undefined);
        }
      });

      return () => {
        isActive = false;
      };
    }

    const nextObjectUrl = URL.createObjectURL(file);

    queueMicrotask(() => {
      if (isActive) {
        setObjectUrlState({ file, url: nextObjectUrl });
      }
    });

    return () => {
      isActive = false;
      URL.revokeObjectURL(nextObjectUrl);
    };
  }, [file]);

  const currentObjectUrlState = objectUrlState;

  if (!currentObjectUrlState || currentObjectUrlState.file !== file) {
    return undefined;
  }

  return currentObjectUrlState.url;
};

export const FileUpload = <TResult,>({
  ref,
  onUpload,
  onUploadComplete,
  onUploadError,
  autoUpload = true,
  concurrency = 3,
  value,
  defaultValue,
  onChange,
  className,
  children,
  id,
  multiple,
  disabled,
  placeholder: placeholderProp,
  title: titleProp,
  description,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...inputProps
}: FileUploadProps<TResult>) => {
  const { t } = useTranslation("thread-ui");
  const title = titleProp ?? t("fileUpload.title", "Upload files");
  const placeholder =
    placeholderProp ??
    t(
      "fileUpload.placeholder",
      "Click to upload, drop files here, or paste files",
    );
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalFiles, setInternalFiles] = useState<File[]>(
    () => defaultValue ?? [],
  );
  const [isDragging, setIsDragging] = useState(false);

  const files = value ?? internalFiles;
  const isControlled = value !== undefined;

  const {
    entries,
    upload,
    retry,
    cancel,
    addFiles,
    removeFile,
    remove,
    getEntries,
  } = useUploadQueue(
    files,
    {
      onUpload,
      onUploadComplete,
      onUploadError,
      autoUpload,
      concurrency,
      disabled,
      multiple,
    },
    (nextFiles) => {
      if (!isControlled) setInternalFiles(nextFiles);
      onChange?.(nextFiles);
    },
  );

  const openFileDialog = useCallback(() => {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  }, [disabled]);

  useImperativeHandle(
    ref,
    () => ({ upload, retry, cancel, remove, openFileDialog, getEntries }),
    [upload, retry, cancel, remove, openFileDialog, getEntries],
  );

  const contextValue = useMemo<FileUploadContextValue>(
    () => ({
      files,
      entries,
      upload,
      retry,
      cancel,
      remove,
      uploadEnabled: !!onUpload,
      inputProps,
      multiple,
      disabled,
      placeholder,
      title,
      description,
      ariaDescribedBy,
      ariaInvalid,
      isDragging,
      setIsDragging,
      addFiles,
      removeFile,
      openFileDialog,
    }),
    [
      files,
      entries,
      upload,
      retry,
      cancel,
      remove,
      onUpload,
      inputProps,
      multiple,
      disabled,
      placeholder,
      title,
      description,
      ariaDescribedBy,
      ariaInvalid,
      isDragging,
      addFiles,
      removeFile,
      openFileDialog,
    ],
  );

  return (
    <FileUploadContext.Provider value={contextValue}>
      <input
        ref={inputRef}
        hidden
        {...inputProps}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        id={inputId}
        multiple={multiple}
        type="file"
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      <div className={cn("w-full", className)} data-slot="file-upload-root">
        {children === undefined ? (
          <>
            <FileUploadDropzone />
            <FileUploadList />
          </>
        ) : (
          children
        )}
      </div>
    </FileUploadContext.Provider>
  );
};

export type FileUploadDropzoneProps = ComponentProps<"div">;

export const FileUploadDropzone: FC<FileUploadDropzoneProps> = ({
  children,
  className,
  tabIndex,
  onClick,
  onDragLeave,
  onDragOver,
  onDrop,
  onKeyDown,
  onPaste,
  ...props
}) => {
  const { t } = useTranslation("thread-ui");
  const titleId = useId();
  const descriptionId = useId();
  const hasCustomContent = children != null;
  const {
    inputProps,
    disabled,
    placeholder,
    title,
    description,
    ariaDescribedBy,
    ariaInvalid,
    isDragging,
    setIsDragging,
    addFiles,
    openFileDialog,
  } = useFileUploadContext();

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    onClick?.(event);

    if (!event.defaultPrevented) {
      openFileDialog();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);

    if (
      event.defaultPrevented ||
      event.target !== event.currentTarget ||
      (event.key !== "Enter" && event.key !== " ")
    ) {
      return;
    }

    event.preventDefault();
    openFileDialog();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    onDragOver?.(event);

    if (disabled || event.defaultPrevented) {
      return;
    }

    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    onDragLeave?.(event);

    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    onDrop?.(event);

    if (disabled || event.defaultPrevented) {
      return;
    }

    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    onPaste?.(event);

    if (disabled || event.defaultPrevented) {
      return;
    }

    const pastedFiles = getClipboardFiles(event);

    if (!pastedFiles.length) {
      return;
    }

    event.preventDefault();
    addFiles(pastedFiles);
  };

  const describedBy =
    [
      props["aria-describedby"] ?? ariaDescribedBy,
      !hasCustomContent && descriptionId,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Empty
      {...props}
      aria-describedby={describedBy}
      aria-disabled={disabled}
      aria-invalid={ariaInvalid}
      aria-label={props["aria-label"] ?? inputProps["aria-label"]}
      data-disabled={disabled}
      data-dragging={isDragging}
      data-slot="file-upload"
      role={hasCustomContent ? "button" : "group"}
      aria-labelledby={
        props["aria-labelledby"] ??
        inputProps["aria-labelledby"] ??
        (!(props["aria-label"] ?? inputProps["aria-label"]) && !hasCustomContent
          ? titleId
          : undefined)
      }
      className={cn(
        "text-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 cursor-pointer border transition-colors outline-none focus-visible:ring-3 aria-invalid:ring-3",
        "data-[dragging=false]:hover:bg-muted/50 data-[dragging=true]:border-ring data-[dragging=true]:bg-muted",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
        className,
      )}
      tabIndex={
        disabled ? undefined : (tabIndex ?? (hasCustomContent ? 0 : -1))
      }
      onClick={handleClick}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
    >
      {children ?? (
        <>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileUploadDropzoneIcon />
            </EmptyMedia>
            <EmptyTitle id={titleId}>{title}</EmptyTitle>
            <EmptyDescription id={descriptionId}>
              {description ?? placeholder}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              aria-describedby={describedBy}
              disabled={disabled}
              type="button"
            >
              {t("fileUpload.browseFiles", "Browse files")}
            </Button>
          </EmptyContent>
        </>
      )}
    </Empty>
  );
};

export type FileUploadDropzoneIconProps = ComponentProps<"svg">;

export const FileUploadDropzoneIcon: FC<FileUploadDropzoneIconProps> = ({
  className,
  ...props
}) => (
  <CloudUploadIcon
    {...props}
    className={cn("text-foreground size-5 shrink-0", className)}
  />
);

export type FileUploadDropzoneDescriptionProps = ComponentProps<"span">;

export const FileUploadDropzoneDescription: FC<
  FileUploadDropzoneDescriptionProps
> = ({ children, className, ...props }) => (
  <span
    {...props}
    className={cn("text-muted-foreground text-sm/relaxed", className)}
  >
    {children}
  </span>
);

export type FileUploadListProps = ComponentProps<"div">;

export const FileUploadList: FC<FileUploadListProps> = ({
  children,
  className,
  ...props
}) => {
  const { files, entries, removeFile } = useFileUploadContext();

  if (!files.length) {
    return null;
  }

  return (
    <div
      {...props}
      className={cn("mt-3 flex w-full flex-col gap-2 text-left", className)}
      data-slot="file-upload-list"
    >
      {files.map((file, index) => (
        <FileUploadItemContext.Provider
          key={entries[index]?.id ?? getFileKey(file, index)}
          value={{
            file,
            index,
            entry: entries[index],
            remove: () => removeFile(index),
          }}
        >
          {children ?? <FileUploadItem />}
        </FileUploadItemContext.Provider>
      ))}
    </div>
  );
};

export interface FileUploadItemProps extends ComponentProps<"div"> {
  /** Bind to a task in the enclosing FileUpload. Takes precedence over file. */
  entryId?: string;
  file?: File;
  onRemove?: () => void;
}

export const FileUploadItem: FC<FileUploadItemProps> = ({
  entryId,
  file,
  onRemove,
  className,
  ...props
}) => {
  const context = useContext(FileUploadContext);
  const itemContext = useContext(FileUploadItemContext);
  const inheritedItem =
    entryId === undefined && (file === undefined || file === itemContext?.file)
      ? itemContext
      : undefined;
  const matches =
    entryId === undefined && !inheritedItem && file
      ? context?.entries.filter((entry) => entry.file === file)
      : undefined;

  if (matches && matches.length > 1) {
    throw new Error(
      "FileUploadItem matches multiple tasks. Pass entryId to identify the task.",
    );
  }

  const entry =
    entryId !== undefined
      ? context?.entries.find((entry) => entry.id === entryId)
      : (inheritedItem?.entry ?? matches?.[0]);

  // A removed task must not fall back to a different occurrence of the same File.
  if (entryId !== undefined && !entry) return null;

  const resolvedFile = entry?.file ?? file ?? inheritedItem?.file;
  const remove =
    onRemove ??
    (entry && context ? () => context.remove(entry.id) : inheritedItem?.remove);

  if (!resolvedFile) {
    throw new Error(
      "FileUploadItem must be used within FileUploadList or receive an entryId or file prop.",
    );
  }

  return (
    <div
      {...props}
      className={cn("min-w-0", className)}
      data-slot="file-upload-item"
    >
      <FileUploadAttachment
        entry={entry}
        file={resolvedFile}
        onRemove={remove}
      />
    </div>
  );
};

const FileUploadAttachment = ({
  entry,
  file,
  onRemove,
}: {
  entry?: FileUploadEntry;
  file: File;
  onRemove?: () => void;
}) => {
  const { t } = useTranslation("thread-ui");
  const context = useContext(FileUploadContext);
  const status = entry?.status ?? "idle";
  const state = status === "queued" || status === "canceled" ? "idle" : status;
  const active = status === "queued" || status === "uploading";
  const statusLabels = {
    idle: t("fileUpload.status.idle", "Waiting to upload"),
    queued: t("fileUpload.status.queued", "Queued"),
    uploading: t("fileUpload.status.uploading", "Uploading"),
    done: t("fileUpload.status.done", "Uploaded"),
    error: t("fileUpload.status.error", "Upload failed"),
    canceled: t("fileUpload.status.canceled", "Canceled"),
  };
  const isImage = isImageFile(file);
  const objectUrl = useObjectUrl(isImage ? file : undefined);
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string>();
  const previewUrl = objectUrl === failedPreviewUrl ? undefined : objectUrl;

  return (
    <Attachment className="w-full focus-within:ring-0" state={state}>
      <AttachmentMedia variant={previewUrl ? "image" : "icon"}>
        {previewUrl ? (
          <img
            key={previewUrl}
            alt={file.name}
            className="h-full w-full object-cover"
            src={previewUrl}
            onError={() => setFailedPreviewUrl(previewUrl)}
          />
        ) : (
          <FileUploadFileIcon className="size-4" file={file} />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle title={file.name}>{file.name}</AttachmentTitle>
        {context?.uploadEnabled && (
          <AttachmentDescription role="status">
            {statusLabels[status]}
            {status === "uploading" &&
              entry?.progress !== undefined &&
              ` ${Math.round(entry.progress)}%`}
          </AttachmentDescription>
        )}
      </AttachmentContent>
      <AttachmentActions>
        {context?.uploadEnabled && entry && status !== "done" && (
          <AttachmentAction
            disabled={context.disabled}
            type="button"
            aria-label={t(
              active
                ? "fileUpload.cancelFile"
                : status === "idle"
                  ? "fileUpload.uploadFile"
                  : "fileUpload.retryFile",
              {
                defaultValue: active
                  ? "Cancel upload of {{name}}"
                  : status === "idle"
                    ? "Upload {{name}}"
                    : "Retry upload of {{name}}",
                interpolation: { escapeValue: false },
                name: file.name,
              },
            )}
            onClick={(event) => {
              event.stopPropagation();
              if (active) context.cancel(entry.id);
              else if (status === "idle") context.upload(entry.id);
              else context.retry(entry.id);
            }}
          >
            {active ? (
              <BanIcon className="size-4" />
            ) : status === "idle" ? (
              <PlayIcon className="size-4" />
            ) : (
              <RotateCcwIcon className="size-4" />
            )}
          </AttachmentAction>
        )}
        <AttachmentAction
          disabled={context?.disabled}
          type="button"
          aria-label={t("fileUpload.removeFile", {
            defaultValue: "Remove {{name}}",
            interpolation: { escapeValue: false },
            name: file.name,
          })}
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.();
          }}
        >
          <XIcon className="size-4" />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
};

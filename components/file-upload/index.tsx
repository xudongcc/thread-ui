"use client";

import { FileIcon, UploadIcon, XIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import type {
  ClipboardEvent,
  ComponentProps,
  DragEvent,
  FC,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { cn } from "@/lib/utils";

type FileUploadInputProps = Omit<
  ComponentProps<"input">,
  | "children"
  | "className"
  | "defaultValue"
  | "onChange"
  | "placeholder"
  | "title"
  | "type"
  | "value"
>;

export interface FileUploadProps extends FileUploadInputProps {
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  /** Optional heading in the default dropzone. */
  title?: ReactNode;
  /** Default dropzone description; falls back to placeholder. */
  description?: ReactNode;
  /** Text shown in the dropzone when description is not provided. */
  placeholder?: string;
  className?: string;
  children?: ReactNode;
}

type FileUploadContextValue = {
  files: File[];
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

const videoExtensions = new Set(["m4v", "mov", "mp4", "ogg", "ogv", "webm"]);

const FileUploadContext = createContext<FileUploadContextValue | null>(null);
const FileUploadDropzoneContext = createContext<{ placeholder: string } | null>(
  null,
);
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

export type UseFileUploadReturn = Pick<
  FileUploadContextValue,
  | "files"
  | "multiple"
  | "disabled"
  | "isDragging"
  | "addFiles"
  | "removeFile"
  | "openFileDialog"
>;

/** Access file selection state and actions from a descendant of FileUpload. */
export const useFileUpload = (): UseFileUploadReturn => {
  const {
    files,
    multiple,
    disabled,
    isDragging,
    addFiles,
    removeFile,
    openFileDialog,
  } = useFileUploadContext();
  return {
    files,
    multiple,
    disabled,
    isDragging,
    addFiles,
    removeFile,
    openFileDialog,
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

const getPreviewType = (file: File) => {
  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && imageExtensions.has(extension)) {
    return "image";
  }

  if (extension && videoExtensions.has(extension)) {
    return "video";
  }

  return null;
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

export const FileUpload: FC<FileUploadProps> = ({
  value,
  defaultValue,
  onChange,
  className,
  children,
  id,
  multiple,
  disabled,
  placeholder: placeholderProp,
  title,
  description,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...inputProps
}) => {
  const { t } = useTranslation("thread-ui");
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

  const addFiles = useCallback(
    (nextFiles: File[]) => {
      if (disabled || !nextFiles.length) {
        return;
      }

      const normalizedFiles = multiple
        ? [...files, ...nextFiles]
        : nextFiles.slice(0, 1);

      if (!isControlled) {
        setInternalFiles(normalizedFiles);
      }

      onChange?.(normalizedFiles);
    },
    [disabled, files, isControlled, multiple, onChange],
  );

  const removeFile = useCallback(
    (index: number) => {
      if (disabled) return;

      const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);

      if (!isControlled) {
        setInternalFiles(nextFiles);
      }

      onChange?.(nextFiles);
    },
    [disabled, files, isControlled, onChange],
  );

  const openFileDialog = useCallback(() => {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  }, [disabled]);

  const contextValue = useMemo<FileUploadContextValue>(
    () => ({
      files,
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

export interface FileUploadDropzoneProps extends ComponentProps<"div"> {
  placeholder?: string;
}

export const FileUploadDropzone: FC<FileUploadDropzoneProps> = ({
  children,
  className,
  placeholder,
  tabIndex,
  onClick,
  onDragLeave,
  onDragOver,
  onDrop,
  onKeyDown,
  onPaste,
  ...props
}) => {
  const {
    inputProps,
    disabled,
    placeholder: contextPlaceholder,
    title,
    description,
    ariaDescribedBy,
    ariaInvalid,
    isDragging,
    setIsDragging,
    addFiles,
    openFileDialog,
  } = useFileUploadContext();
  const resolvedPlaceholder = placeholder ?? contextPlaceholder;
  const dropzoneContextValue = useMemo(
    () => ({ placeholder: resolvedPlaceholder }),
    [resolvedPlaceholder],
  );

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

  return (
    <>
      <FileUploadDropzoneContext.Provider value={dropzoneContextValue}>
        <div
          {...props}
          aria-describedby={props["aria-describedby"] ?? ariaDescribedBy}
          aria-disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-label={props["aria-label"] ?? inputProps["aria-label"]}
          data-disabled={disabled}
          data-dragging={isDragging}
          data-slot="file-upload"
          role="button"
          tabIndex={disabled ? undefined : (tabIndex ?? 0)}
          aria-labelledby={
            props["aria-labelledby"] ?? inputProps["aria-labelledby"]
          }
          className={cn(
            "border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed px-4 py-6 text-center shadow-xs transition-[background-color,border-color,box-shadow] outline-none focus-visible:ring-[3px]",
            "data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/5",
            "data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
            className,
          )}
          onClick={handleClick}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        >
          {children ?? (
            <>
              <FileUploadDropzoneIcon />
              {title != null && (
                <span className="text-sm font-medium">{title}</span>
              )}
              {title != null && " "}
              <FileUploadDropzoneDescription>
                {description}
              </FileUploadDropzoneDescription>
            </>
          )}
        </div>
      </FileUploadDropzoneContext.Provider>
    </>
  );
};

export type FileUploadDropzoneIconProps = ComponentProps<"svg">;

export const FileUploadDropzoneIcon: FC<FileUploadDropzoneIconProps> = ({
  className,
  ...props
}) => (
  <UploadIcon
    {...props}
    className={cn("text-muted-foreground size-5", className)}
  />
);

export interface FileUploadDropzoneDescriptionProps extends ComponentProps<"span"> {
  placeholder?: string;
}

export const FileUploadDropzoneDescription: FC<
  FileUploadDropzoneDescriptionProps
> = ({ children, className, placeholder, ...props }) => {
  const dropzoneContext = useContext(FileUploadDropzoneContext);
  const { placeholder: contextPlaceholder } = useFileUploadContext();

  return (
    <span {...props} className={cn("text-muted-foreground text-sm", className)}>
      {children ??
        placeholder ??
        dropzoneContext?.placeholder ??
        contextPlaceholder}
    </span>
  );
};

export type FileUploadListProps = ComponentProps<"ul">;

export const FileUploadList: FC<FileUploadListProps> = ({
  children,
  className,
  ...props
}) => {
  const { files, removeFile } = useFileUploadContext();

  if (!files.length) {
    return null;
  }

  return (
    <ul
      {...props}
      className={cn("mt-3 flex w-full flex-col gap-2 text-left", className)}
      data-slot="file-upload-list"
    >
      {files.map((file, index) => (
        <FileUploadItemContext.Provider
          key={getFileKey(file, index)}
          value={{ file, index, remove: () => removeFile(index) }}
        >
          {children ?? <FileUploadItem />}
        </FileUploadItemContext.Provider>
      ))}
    </ul>
  );
};

export interface FileUploadItemProps extends ComponentProps<"li"> {
  file?: File;
  onRemove?: () => void;
}

export const FileUploadItem: FC<FileUploadItemProps> = ({
  file,
  onRemove,
  className,
  ...props
}) => {
  const itemContext = useContext(FileUploadItemContext);
  const resolvedFile = file ?? itemContext?.file;
  const remove = onRemove ?? itemContext?.remove;

  if (!resolvedFile) {
    throw new Error(
      "FileUploadItem must be used within FileUploadList or receive a file prop.",
    );
  }

  return (
    <li
      {...props}
      className={cn("min-w-0", className)}
      data-slot="file-upload-item"
    >
      <FileUploadAttachment file={resolvedFile} onRemove={remove} />
    </li>
  );
};

export type FileUploadPreviewProps = ComponentProps<"ul">;

export const FileUploadPreview: FC<FileUploadPreviewProps> = ({
  children,
  className,
  ...props
}) => {
  const { files, removeFile } = useFileUploadContext();

  if (!files.length) {
    return null;
  }

  return (
    <ul
      {...props}
      className={cn("mt-3 grid w-full grid-cols-2 gap-3", className)}
      data-slot="file-upload-preview"
    >
      {files.map((file, index) => (
        <FileUploadItemContext.Provider
          key={getFileKey(file, index)}
          value={{ file, index, remove: () => removeFile(index) }}
        >
          {children ?? <FileUploadPreviewItem />}
        </FileUploadItemContext.Provider>
      ))}
    </ul>
  );
};

export interface FileUploadPreviewItemProps extends ComponentProps<"li"> {
  file?: File;
  onRemove?: () => void;
  mediaClassName?: string;
}

export const FileUploadPreviewItem: FC<FileUploadPreviewItemProps> = ({
  file,
  onRemove,
  className,
  mediaClassName,
  ...props
}) => {
  const itemContext = useContext(FileUploadItemContext);
  const resolvedFile = file ?? itemContext?.file;
  const remove = onRemove ?? itemContext?.remove;

  if (!resolvedFile) {
    throw new Error(
      "FileUploadPreviewItem must be used within FileUploadPreview or receive a file prop.",
    );
  }

  return (
    <li
      {...props}
      className={cn("min-w-0", className)}
      data-slot="file-upload-preview-item"
    >
      <FileUploadAttachment
        preview
        file={resolvedFile}
        mediaClassName={mediaClassName}
        onRemove={remove}
      />
    </li>
  );
};

const FileUploadAttachment = ({
  file,
  preview = false,
  mediaClassName,
  onRemove,
}: {
  file: File;
  preview?: boolean;
  mediaClassName?: string;
  onRemove?: () => void;
}) => {
  const { t } = useTranslation("thread-ui");
  const context = useContext(FileUploadContext);
  const previewType = preview ? getPreviewType(file) : null;
  const objectUrl = useObjectUrl(previewType ? file : undefined);

  return (
    <Attachment
      orientation={preview ? "vertical" : "horizontal"}
      state="idle"
      className={cn(
        "w-full",
        preview && "has-data-[slot=attachment-content]:w-full",
      )}
    >
      <AttachmentMedia variant={previewType === "image" ? "image" : "icon"}>
        {previewType && objectUrl ? (
          previewType === "image" ? (
            <img
              alt={file.name}
              className={cn("h-full w-full object-cover", mediaClassName)}
              src={objectUrl}
            />
          ) : (
            <video
              controls
              playsInline
              aria-label={file.name}
              className={cn("h-full w-full object-cover", mediaClassName)}
              src={objectUrl}
            />
          )
        ) : (
          <FileIcon className="size-4" />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle title={file.name}>{file.name}</AttachmentTitle>
      </AttachmentContent>
      <AttachmentActions>
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

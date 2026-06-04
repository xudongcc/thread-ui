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
import type {
  ChangeEvent,
  ClipboardEvent,
  ComponentProps,
  DragEvent,
  FC,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject,
} from "react";

import { cn } from "@/lib/utils";

type FileUploadInputProps = Omit<
  ComponentProps<"input">,
  | "children"
  | "className"
  | "defaultValue"
  | "onChange"
  | "placeholder"
  | "type"
  | "value"
>;

export interface FileUploadProps extends FileUploadInputProps {
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  /** Text shown in the drop zone when no files are selected. */
  placeholder?: string;
  className?: string;
  children?: ReactNode;
}

type FileUploadContextValue = {
  files: File[];
  inputProps: FileUploadInputProps;
  inputId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  multiple?: boolean;
  disabled?: boolean;
  placeholder: string;
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
  placeholder = "Click to upload, drop files here, or paste files",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...inputProps
}) => {
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
      if (!nextFiles.length) {
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
    [files, isControlled, multiple, onChange],
  );

  const removeFile = useCallback(
    (index: number) => {
      const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);

      if (!isControlled) {
        setInternalFiles(nextFiles);
      }

      onChange?.(nextFiles);
    },
    [files, isControlled, onChange],
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
      inputId,
      inputRef,
      multiple,
      disabled,
      placeholder,
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
      inputId,
      multiple,
      disabled,
      placeholder,
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
      {children === undefined ? (
        <>
          <FileUploadDropzone className={className} />
          <FileUploadList />
        </>
      ) : (
        <div className={className} data-slot="file-upload-root">
          {children}
        </div>
      )}
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
    inputId,
    inputRef,
    multiple,
    disabled,
    placeholder: contextPlaceholder,
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

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

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
        onChange={handleInputChange}
      />

      <FileUploadDropzoneContext.Provider value={dropzoneContextValue}>
        <div
          {...props}
          aria-describedby={ariaDescribedBy}
          aria-disabled={disabled}
          aria-invalid={ariaInvalid}
          data-disabled={disabled}
          data-dragging={isDragging}
          data-slot="file-upload"
          role="button"
          tabIndex={disabled ? undefined : (tabIndex ?? 0)}
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
              <FileUploadDropzoneDescription />
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
      data-slot="file-upload-item"
      className={cn(
        "bg-muted/50 flex min-h-9 items-center gap-2 rounded-md px-2.5 py-1.5 text-sm",
        className,
      )}
    >
      <FileIcon className="text-muted-foreground size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{resolvedFile.name}</span>
      <button
        aria-label={`Remove ${resolvedFile.name}`}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-[3px]"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          remove?.();
        }}
      >
        <XIcon className="size-4" />
      </button>
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
  const previewType = resolvedFile ? getPreviewType(resolvedFile) : null;
  const objectUrl = useObjectUrl(
    previewType && resolvedFile ? resolvedFile : undefined,
  );

  if (!resolvedFile) {
    throw new Error(
      "FileUploadPreviewItem must be used within FileUploadPreview or receive a file prop.",
    );
  }

  if (!previewType || !objectUrl) {
    return (
      <FileUploadItem
        {...props}
        className={className}
        file={resolvedFile}
        onRemove={remove}
      />
    );
  }

  return (
    <li
      {...props}
      data-slot="file-upload-preview-item"
      className={cn(
        "bg-muted/40 overflow-hidden rounded-md border text-sm shadow-xs",
        className,
      )}
    >
      <div className="relative aspect-square">
        {previewType === "image" ? (
          <img
            alt={resolvedFile.name}
            className={cn("h-full w-full object-cover", mediaClassName)}
            src={objectUrl}
          />
        ) : (
          <video
            controls
            playsInline
            aria-label={resolvedFile.name}
            className={cn("h-full w-full object-cover", mediaClassName)}
            src={objectUrl}
          />
        )}
        <button
          aria-label={`Remove ${resolvedFile.name}`}
          className="bg-background/90 text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-md shadow-xs backdrop-blur transition-colors outline-none focus-visible:ring-[3px]"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            remove?.();
          }}
        >
          <XIcon className="size-4" />
        </button>
      </div>
      <div className="flex min-h-9 items-center px-2.5 py-1.5">
        <span className="min-w-0 flex-1 truncate">{resolvedFile.name}</span>
      </div>
    </li>
  );
};

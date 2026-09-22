import {
  FileArchiveIcon,
  FileAudioIcon,
  FileChartColumnIcon,
  FileIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileVideoIcon,
} from "lucide-react";
import { createElement } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

const iconRules: {
  icon: LucideIcon;
  mimeTypes: string[];
  extensions: string[];
}[] = [
  {
    icon: FileImageIcon,
    mimeTypes: [],
    extensions: [
      "avif",
      "bmp",
      "gif",
      "heic",
      "heif",
      "ico",
      "jpeg",
      "jpg",
      "png",
      "svg",
      "tif",
      "tiff",
      "webp",
    ],
  },
  {
    icon: FileVideoIcon,
    mimeTypes: [],
    extensions: [
      "avi",
      "m4v",
      "mkv",
      "mov",
      "mp4",
      "mpeg",
      "mpg",
      "ogv",
      "webm",
    ],
  },
  {
    icon: FileAudioIcon,
    mimeTypes: [],
    extensions: [
      "aac",
      "flac",
      "m4a",
      "mp3",
      "oga",
      "ogg",
      "opus",
      "wav",
      "wma",
    ],
  },
  {
    icon: FileSpreadsheetIcon,
    mimeTypes: [
      "text/csv",
      "text/tab-separated-values",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel.sheet.macroenabled.12",
      "application/vnd.oasis.opendocument.spreadsheet",
    ],
    extensions: ["csv", "tsv", "xls", "xlsx", "xlsm", "ods"],
  },
  {
    icon: FileChartColumnIcon,
    mimeTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.oasis.opendocument.presentation",
    ],
    extensions: ["ppt", "pptx", "odp"],
  },
  {
    icon: FileArchiveIcon,
    mimeTypes: [
      "application/zip",
      "application/x-zip-compressed",
      "application/x-7z-compressed",
      "application/vnd.rar",
      "application/x-rar-compressed",
      "application/gzip",
      "application/x-gzip",
      "application/x-tar",
      "application/x-bzip2",
      "application/x-xz",
    ],
    extensions: ["zip", "7z", "rar", "gz", "gzip", "tar", "tgz", "bz2", "xz"],
  },
  {
    icon: FileTextIcon,
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.oasis.opendocument.text",
      "application/rtf",
      "text/rtf",
      "text/markdown",
    ],
    extensions: ["pdf", "doc", "docx", "odt", "rtf", "txt", "md", "mdx", "log"],
  },
];

const getFileIcon = (file: File): LucideIcon => {
  const mimeType = file.type.split(";")[0]!.trim().toLowerCase();
  if (mimeType.startsWith("image/")) return FileImageIcon;
  if (mimeType.startsWith("video/")) return FileVideoIcon;
  if (mimeType.startsWith("audio/")) return FileAudioIcon;

  const mimeIcon = iconRules.find((rule) => rule.mimeTypes.includes(mimeType));
  if (mimeIcon) return mimeIcon.icon;

  const extension = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : "";
  const extensionIcon = iconRules.find((rule) =>
    rule.extensions.includes(extension),
  );
  return (
    extensionIcon?.icon ??
    (mimeType.startsWith("text/") ? FileTextIcon : FileIcon)
  );
};

export const FileUploadFileIcon = ({
  file,
  ...props
}: LucideProps & { file: File }) => {
  return createElement(getFileIcon(file), props);
};

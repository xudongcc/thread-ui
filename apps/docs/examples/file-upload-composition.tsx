"use client";

import { FileIcon, XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadDropzoneDescription,
  useFileUpload,
} from "@/components/thread-ui/file-upload";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";

const SelectedAttachments = () => {
  const { files, removeFile, disabled } = useFileUpload();
  const { t } = useTranslation("thread-ui");

  return (
    <>
      {files.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="max-w-full min-w-0"
            >
              <Attachment size="sm" state="idle">
                <AttachmentMedia>
                  <FileIcon />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle title={file.name}>
                    {file.name}
                  </AttachmentTitle>
                </AttachmentContent>
                <AttachmentActions>
                  <AttachmentAction
                    disabled={disabled}
                    type="button"
                    aria-label={t("fileUpload.removeFile", {
                      defaultValue: "Remove {{name}}",
                      interpolation: { escapeValue: false },
                      name: file.name,
                    })}
                    onClick={() => removeFile(index)}
                  >
                    <XIcon />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

const Example = () => (
  <FileUpload multiple className="max-w-md">
    <FileUploadDropzone>
      <FileUploadDropzoneDescription>
        Choose files, drop them here, or paste them.
      </FileUploadDropzoneDescription>
    </FileUploadDropzone>
    <SelectedAttachments />
  </FileUpload>
);

export default Example;

"use client";

import { useId, useState } from "react";

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadDropzoneDescription,
  FileUploadDropzoneIcon,
  FileUploadPreview,
  FileUploadPreviewItem,
} from "@/components/thread-ui/file-upload";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

const Example = () => {
  const id = useId();
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Field className="w-full max-w-md">
      <FieldLabel htmlFor={id}>Media</FieldLabel>
      <FileUpload
        multiple
        accept="image/*,video/*"
        id={id}
        value={files}
        onChange={setFiles}
      >
        <FileUploadDropzone>
          <FileUploadDropzoneIcon />
          <FileUploadDropzoneDescription>
            Drop images or videos here.
          </FileUploadDropzoneDescription>
        </FileUploadDropzone>
        <FileUploadPreview>
          <FileUploadPreviewItem />
        </FileUploadPreview>
      </FileUpload>
      <FieldDescription>
        Images and videos render as previews after selection.
      </FieldDescription>
    </Field>
  );
};

export default Example;

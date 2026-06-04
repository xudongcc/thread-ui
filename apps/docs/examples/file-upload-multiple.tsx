"use client";

import { useId, useState } from "react";

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadDropzoneDescription,
  FileUploadDropzoneIcon,
  FileUploadItem,
  FileUploadList,
} from "@/components/thread-ui/file-upload";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

const Example = () => {
  const id = useId();
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Field className="w-full max-w-md">
      <FieldLabel htmlFor={id}>Files</FieldLabel>
      <FileUpload multiple id={id} value={files} onChange={setFiles}>
        <FileUploadDropzone>
          <FileUploadDropzoneIcon />
          <FileUploadDropzoneDescription />
        </FileUploadDropzone>
        <FileUploadList>
          <FileUploadItem />
        </FileUploadList>
      </FileUpload>
      <FieldDescription>
        Drop files multiple times to append them to the list.
      </FieldDescription>
    </Field>
  );
};

export default Example;

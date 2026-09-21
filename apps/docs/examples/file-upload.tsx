"use client";

import { useId, useState } from "react";

import { FileUpload } from "@/components/thread-ui/file-upload";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

const Example = () => {
  const id = useId();
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Field className="w-full max-w-md">
      <FieldLabel htmlFor={id}>Attachments</FieldLabel>
      <FileUpload
        multiple
        accept="image/*,.pdf"
        id={id}
        title="Upload attachments"
        value={files}
        onChange={setFiles}
      />

      <FieldDescription>
        Drop files here, paste from your clipboard, or click to browse.
      </FieldDescription>
    </Field>
  );
};

export default Example;

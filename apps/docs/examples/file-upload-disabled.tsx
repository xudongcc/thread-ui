import {
  FileUpload,
  FileUploadDropzone,
  FileUploadDropzoneDescription,
  FileUploadDropzoneIcon,
  FileUploadItem,
  FileUploadList,
} from "@/components/thread-ui/file-upload";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

const Example = () => (
  <Field data-disabled className="w-full max-w-md">
    <FieldLabel htmlFor="locked-attachments">Attachments</FieldLabel>
    <FileUpload disabled id="locked-attachments">
      <FileUploadDropzone>
        <FileUploadDropzoneIcon />
        <FileUploadDropzoneDescription />
      </FileUploadDropzone>
      <FileUploadList>
        <FileUploadItem />
      </FileUploadList>
    </FileUpload>
    <FieldDescription>
      Uploads are unavailable while this form is locked.
    </FieldDescription>
  </Field>
);

export default Example;

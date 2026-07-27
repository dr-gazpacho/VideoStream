import { ReadMetadata } from "~/components/read-metadata";
import { Upload } from "~/components/upload";

export default function VideoUploadPage(): React.JSX.Element {
  return (
    <div>
      <Upload />
      <ReadMetadata />
    </div>
  );
}

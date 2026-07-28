import { Input, ALL_FORMATS, BlobSource } from "mediabunny";
import { useState } from "react";

export const Upload: React.FC = () => {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [input, setInput] = useState<Input<BlobSource> | null>(null);

  function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>): void {
    const uploadedFile = !!event?.target?.files && event.target.files[0];
    if (uploadedFile && uploadedFile.type.startsWith("video")) {
      const newInput = new Input({
        formats: ALL_FORMATS,
        source: new BlobSource(uploadedFile),
      });
      setFile(uploadedFile);
      setInput(newInput);
    }
  }

  console.log(input)

  return (
    <div>
      <p>The Uploader</p>
      <input type="file" id="input" onChange={handleUploadFile} />
    </div>
  );
};

// to do: read and print some video and audio data? maybe generate some thumbnails?
// big work is now that you have an instance of input, what do you do with it?
// eventually work toward a media player OR subtitles adder OR transcoder?
// something

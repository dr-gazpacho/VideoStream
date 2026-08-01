import { useState } from "react";
import { useMediaLibrary, type VideoMetadata } from "~/context/media-context";
import { ReadMetadata } from "~/components/read-metadata";
import { EmptyMediaLibrary } from "~/components/empty-media-library";

import {
  Input,
  Output,
  WebMOutputFormat,
  BufferTarget,
  Conversion,
} from "mediabunny";

export function ConverterPage() {
  const { clips } = useMediaLibrary();
  const hasNoClips = !!!clips.length;
  const [selectedMetadata, setSelectedMetadata] =
    useState<VideoMetadata | null>(null);
  const [convertedFile, setConvertedFile] = useState<Output<
    WebMOutputFormat,
    BufferTarget
  > | null>(null);

  async function handleConversion(input: Input) {
    const output = new Output({
      format: new WebMOutputFormat(),
      target: new BufferTarget(),
    });
    const conversion = await Conversion.init({ input, output });
    if (!conversion.isValid) {
      // Conversion is invalid and cannot be executed without error.
      // This field gives reasons for why tracks were discarded:
      conversion.discardedTracks; // => DiscardedTrack[]

      return;
    }

    await conversion.execute();
    setConvertedFile(output);
  }

  // we convert!
  convertedFile && console.log(convertedFile);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <EmptyMediaLibrary clips={clips} />
      <div>
        {clips.map((clip) => {
          return (
            <ReadMetadata
              metadata={clip}
              withHeader={false}
              variant="small"
              handleClick={setSelectedMetadata}
            />
          );
        })}
      </div>
      <button
        onClick={() => {
          if (selectedMetadata) handleConversion(selectedMetadata.input);
        }}
      >
        Run simple conversion
      </button>
      {selectedMetadata && (
        <ReadMetadata
          metadata={selectedMetadata}
          withHeader={false}
          variant="large"
        />
      )}
    </div>
  );
}

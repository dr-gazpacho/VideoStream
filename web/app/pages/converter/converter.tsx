import { useState } from "react";
import { useMediaLibrary, type VideoMetadata } from "~/context/media-context";
import { ReadMetadata } from "~/components/read-metadata";
import { EmptyMediaLibrary } from "~/components/empty-media-library";
import { createVideoMetadataFromFile } from "~/utils/metadata.util";
import { Output, WebMOutputFormat, BufferTarget, Conversion } from "mediabunny";

export function ConverterPage() {
  const { clips, addClip } = useMediaLibrary();
  const [selectedMetadata, setSelectedMetadata] =
    useState<VideoMetadata | null>(null);
  const [convertedMetadata, setConvertedMetadata] =
    useState<VideoMetadata | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  async function handleConversion(sourceMetadata: VideoMetadata) {
    setIsConverting(true);
    try {
      const output = new Output({
        format: new WebMOutputFormat(),
        target: new BufferTarget(),
      });

      const conversion = await Conversion.init({
        input: sourceMetadata.input,
        output,
      });

      if (!conversion.isValid) {
        console.error("Conversion invalid:", conversion.discardedTracks);
        return;
      }

      await conversion.execute();

      // want to make a new instance of a File
      // get raw output buffer from BufferTarget
      const buffer = output.target.buffer;
      if (!buffer) throw new Error("Output buffer is empty");

      // cenerate new File name (e.g. sample.mp4 -> sample_converted.webm)
      const outputName =
        sourceMetadata.name.replace(/\.[^/.]+$/, "") + "_converted.webm";

      // wrap buffer into a standard File object
      const convertedFile = new File([buffer], outputName, {
        type: "video/webm",
      });

      // extract VideoMetadata/create new Input from the newly created file
      const outputMetadata = await createVideoMetadataFromFile(
        convertedFile,
        true,
      );

      setConvertedMetadata(outputMetadata);

      // create onClick handler on the card to handle this later
      addClip(outputMetadata);
    } catch (err) {
      console.error("Conversion failed:", err);
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <EmptyMediaLibrary clips={clips} />

      {!!clips.length && (
        <div className="overflow-visible flex gap-2">
          {clips.map((clip) => (
            <ReadMetadata
              key={clip.id}
              metadata={clip}
              withHeader={false}
              variant="small"
              handleClick={setSelectedMetadata}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Video Card */}
        {selectedMetadata && (
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-zinc-500 font-bold block">
              // Source File
            </span>
            <ReadMetadata
              metadata={selectedMetadata}
              withHeader={false}
              variant="card"
            />
          </div>
        )}
        {selectedMetadata && (
          <button
            onClick={() => handleConversion(selectedMetadata)}
            disabled={isConverting}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-xs transition-colors disabled:opacity-50"
          >
            {isConverting ? "Converting..." : "Run simple conversion"}
          </button>
        )}

        {/* Converted Output Video Card */}
        {convertedMetadata && (
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-emerald-500 font-bold block">
              // Converted Output
            </span>
            <ReadMetadata
              metadata={convertedMetadata}
              withHeader={false}
              variant="card"
            />
          </div>
        )}
      </div>
    </div>
  );
}

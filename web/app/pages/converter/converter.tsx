import { useState } from "react";
import { useMediaLibrary, type VideoMetadata } from "~/context/media-context";
import { ReadMetadata } from "~/components/read-metadata";
import { EmptyMediaLibrary } from "~/components/empty-media-library";
import { FormatSelector } from "~/components/format-selector";
import {
  TranscodingProgressDisplay,
  type TranscodingProgress,
} from "~/components/transcoding-progress-display";
import {
  createVideoMetadataFromFile,
  SUPPORTED_OUTPUT_FORMATS,
  type OutputFormatKey,
} from "~/utils/metadata.util";
import { Output, BufferTarget, Conversion } from "mediabunny";

export function ConverterPage() {
  const { clips, addClip } = useMediaLibrary();
  const [selectedMetadata, setSelectedMetadata] =
    useState<VideoMetadata | null>(null);
  const [convertedMetadata, setConvertedMetadata] =
    useState<VideoMetadata | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormatKey>("webm");

  const [transcodingProgress, setTranscodingProgress] =
    useState<TranscodingProgress | null>(null);

  async function handleConversion(
    sourceMetadata: VideoMetadata,
    formatKey: OutputFormatKey = "webm",
  ) {
    setIsConverting(true);
    const targetConfig = SUPPORTED_OUTPUT_FORMATS[formatKey];
    try {
      const output = new Output({
        format: targetConfig.getFormat(),
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

      conversion.onProgress = (progress, processedTime) => {
        setTranscodingProgress({
          time: processedTime,
          percent: progress * 100,
        });
      };

      await conversion.execute();

      // make a new instance of a File (and Input and Video Metadata) out of converted Input
      // get raw output buffer from BufferTarget
      const buffer = output.target.buffer;
      if (!buffer) throw new Error("Output buffer is empty");

      // cenerate new File name (e.g. sample.mp4 -> sample_converted.webm)
      const outputName =
        sourceMetadata.name.replace(/\.[^/.]+$/, "") +
        `_converted.${targetConfig.ext}`;

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
        <div className="w-full bg-zinc-800 border border-zinc-800 rounded-sm p-1">
          <div className="relative [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]">
            <div className="flex gap-2 overflow-x-auto py-1 px-6 scrollbar-none">
              {clips.map((clip) => (
                <div key={clip.id} className="shrink-0">
                  <ReadMetadata
                    metadata={clip}
                    withHeader={false}
                    variant="small"
                    handleClick={setSelectedMetadata}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-row gap-4">
        {/* source card */}
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
          <div className="flex flex-col gap-3 w-64">
            <FormatSelector
              selectedFormat={selectedFormat}
              onChange={setSelectedFormat}
              disabled={isConverting}
            />

            <button
              onClick={() => handleConversion(selectedMetadata, selectedFormat)}
              disabled={isConverting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-xs transition-colors disabled:opacity-50"
            >
              {isConverting ? "Converting..." : "Run simple conversion"}
            </button>

            {transcodingProgress && (
              <TranscodingProgressDisplay progress={transcodingProgress} />
            )}
          </div>
        )}

        {/* converted card */}
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

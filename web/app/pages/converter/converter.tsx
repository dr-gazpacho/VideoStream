import { useState } from "react";
import { useMediaLibrary, type VideoMetadata } from "~/context/media-context";
import { ReadMetadata } from "~/components/read-metadata";
import { NavLink } from "react-router";
import { type PathConfig } from "~/types";

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
      {hasNoClips && (
        <div className="h-full flex items-center">
          <NavLink
            to={"/video-upload"}
            className={({ isActive, isPending }) =>
              [
                "relative px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-amber-400",
                isPending ? "text-amber-300 animate-pulse bg-zinc-900" : "",
                isActive
                  ? "text-zinc-950 bg-amber-500 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            {({ isActive, isPending }) => (
              <span className="flex items-center gap-2">
                {/* Active Status Indicator Light */}
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    isActive
                      ? "bg-zinc-950"
                      : isPending
                        ? "bg-amber-400 animate-ping"
                        : "bg-zinc-700"
                  }`}
                />
                {"Upload"}
              </span>
            )}
          </NavLink>
        </div>
      )}
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

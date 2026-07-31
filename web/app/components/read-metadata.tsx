import type { VideoMetadata } from "~/context/media-context";

interface ReadMetadataProps {
  metadata: VideoMetadata | null;
  withHeader?: boolean;
  variant: "large" | "small";
}

export function ReadMetadata({
  metadata,
  withHeader = true,
  variant,
}: ReadMetadataProps) {
  if (!metadata) {
    return (
      <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-sm text-zinc-600 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-zinc-800" />
        No active media loaded
      </div>
    );
  }

  // Helper to format bytes cleanly
  const formattedSize = (metadata.size / (1024 * 1024)).toFixed(2);
  const formattedDuration = metadata.duration.toFixed(2);

  if (variant === "large")
    return (
      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-sm text-zinc-200 font-mono space-y-4">
        {/* Header with track indicators */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          {withHeader && (
            <h3 className="text-xs uppercase tracking-wider text-amber-500 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              // File Inspector
            </h3>
          )}

          <div className="flex items-center gap-1.5">
            <span
              className={`px-1.5 py-0.5 text-[10px] uppercase font-bold rounded-xs ${
                metadata.hasVideo
                  ? "bg-zinc-800 text-amber-400 border border-amber-500/30"
                  : "bg-zinc-900 text-zinc-600 border border-zinc-800"
              }`}
            >
              Video
            </span>
            <span
              className={`px-1.5 py-0.5 text-[10px] uppercase font-bold rounded-xs ${
                metadata.hasAudio
                  ? "bg-zinc-800 text-amber-400 border border-amber-500/30"
                  : "bg-zinc-900 text-zinc-600 border border-zinc-800"
              }`}
            >
              Audio
            </span>
          </div>
        </div>

        {/* Main File Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Left Column: Container & File Stats */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xs space-y-1.5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold border-b border-zinc-800/40 pb-1">
              File Specifications
            </span>
            <div className="flex justify-between">
              <span className="text-zinc-500">FILENAME:</span>
              <span
                className="text-zinc-200 font-semibold truncate max-w-[180px]"
                title={metadata.name}
              >
                {metadata.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">SIZE:</span>
              <span className="text-zinc-300">{formattedSize} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">DURATION:</span>
              <span className="text-amber-400 font-bold">
                {formattedDuration}s
              </span>
            </div>
          </div>

          {/* Right Column: Video & Audio Track Specs */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xs space-y-1.5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold border-b border-zinc-800/40 pb-1">
              Stream Specs
            </span>

            {/* Video Specs */}
            <div className="flex justify-between">
              <span className="text-zinc-500">RESOLUTION:</span>
              <span className="text-zinc-300">
                {metadata.dimensions
                  ? `${metadata.dimensions.width}x${metadata.dimensions.height}`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">VIDEO CODEC:</span>
              <span className="text-zinc-300 uppercase">
                {metadata.videoCodec ?? "None"}
              </span>
            </div>

            {/* Rotation (if present) */}
            {metadata.rotation !== undefined && metadata.rotation !== 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">ROTATION:</span>
                <span className="text-amber-400">{metadata.rotation}°</span>
              </div>
            )}

            {/* Audio Specs */}
            <div className="flex justify-between">
              <span className="text-zinc-500">AUDIO CODEC:</span>
              <span className="text-zinc-300 uppercase">
                {metadata.audioCodec ?? "None"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );

  if (variant === "small")
    return (
      <div
        key={metadata.name}
        draggable
        className="p-3 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300"
      >
        <p className="font-bold text-amber-500 truncate">{metadata.name}</p>
        <p className="text-zinc-500">{metadata.duration.toFixed(1)}s</p>
      </div>
    );
}

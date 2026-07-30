import React from "react";
import type { VideoMetadata } from "./upload";

interface ReadMetadataProps {
  metadata: VideoMetadata | null;
}

export function ReadMetadata({ metadata }: ReadMetadataProps) {
  if (!metadata) {
    return (
      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-500 text-xs font-mono">
        No video loaded yet.
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 font-mono">
      <h3 className="text-xs uppercase tracking-wider text-amber-500 font-bold mb-2">
        // Metadata Overview
      </h3>
      <ul className="text-xs space-y-1">
        <li>
          <span className="text-zinc-400">Filename:</span> {metadata.name}
        </li>
        <li>
          <span className="text-zinc-400">Duration:</span>{" "}
          {metadata.duration.toFixed(2)}s
        </li>
        <li>
          <span className="text-zinc-400">Size:</span>{" "}
          {(metadata.file.size / (1024 * 1024)).toFixed(2)} MB
        </li>
      </ul>
    </div>
  );
}

import React, { createContext, useContext, useState } from "react";
import { Input, BlobSource, ALL_FORMATS } from "mediabunny";
import type { AudioCodec, VideoCodec } from "mediabunny";

export interface VideoMetadata {
  id: string;
  input: Input;
  duration: number;
  name: string;
  size: number;
  dimensions?: { width: number; height: number };
  rotation?: number;
  videoCodec?: VideoCodec | null;
  audioCodec?: AudioCodec | null;
  hasAudio: boolean;
  hasVideo: boolean;
}

interface MediaContextType {
  clips: VideoMetadata[];
  addClip: (
    file: File,
    metaBuilder: (input: Input) => Omit<VideoMetadata, "id" | "input">,
  ) => void;
  removeClip: (id: string) => void;
  clearAllClips: () => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [clips, setClips] = useState<VideoMetadata[]>([]);

  const addClip = (
    file: File,
    metaBuilder: (input: Input) => Omit<VideoMetadata, "id" | "input">,
  ) => {
    const id = `clip_${Date.now()}_${file.name}`;

    const input = new Input({
      source: new BlobSource(file),
      formats: ALL_FORMATS,
    });

    const meta = metaBuilder(input);

    setClips((prev) => [...prev, { ...meta, id, input }]);
  };

  const removeClip = (id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
  };

  const clearAllClips = () => {
    setClips([]);
  };

  return (
    <MediaContext.Provider
      value={{
        clips,
        addClip,
        removeClip,
        clearAllClips,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

export function useMediaLibrary() {
  const context = useContext(MediaContext);
  if (!context)
    throw new Error("useMediaLibrary must be used within MediaProvider");
  return context;
}

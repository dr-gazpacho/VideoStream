import React, { createContext, useContext, useState } from "react";
import type { AudioCodec, Input, VideoCodec } from "mediabunny";

export interface VideoMetadata {
  id: string;
  input: Input;
  file: File;
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
  addClip: (clip: VideoMetadata) => void;
  removeClip: (id: string) => void;
  clearAllClips: () => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [clips, setClips] = useState<VideoMetadata[]>([]);

  const addClip = (clip: VideoMetadata) => {
    setClips((prev) => [...prev, clip]);
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

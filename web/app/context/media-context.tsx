import React, { createContext, useContext, useState } from "react";
import type { VideoMetadata } from "~/components/upload";

interface MediaContextType {
  clips: VideoMetadata[];
  addClip: (clip: VideoMetadata) => void;
  removeClip: (fileName: string) => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [clips, setClips] = useState<VideoMetadata[]>([]);

  const addClip = (clip: VideoMetadata) => {
    setClips((prev) => [...prev, clip]);
  };

  const removeClip = (name: string) => {
    setClips((prev) => prev.filter((c) => c.name !== name));
  };

  return (
    <MediaContext.Provider value={{ clips, addClip, removeClip }}>
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

import React, { createContext, useContext, useState, useEffect } from "react";
import { set, get, del, entries } from "idb-keyval";
import { Input, BlobSource, ALL_FORMATS } from "mediabunny";
import type { AudioCodec, VideoCodec } from "mediabunny";

export interface VideoMetadata {
  id: string; // Unique storage ID (e.g. timestamp + filename)
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

interface StoredMediaRecord {
  id: string;
  file: File;
}

interface MediaContextType {
  clips: VideoMetadata[];
  isRehydrating: boolean;
  addClip: (
    file: File,
    metaBuilder: (input: Input) => Omit<VideoMetadata, "id" | "input">,
  ) => Promise<void>;
  removeClip: (id: string) => Promise<void>;
  clearAllClips: () => Promise<void>;
  refreshClips: () => Promise<void>;
}

const MediaContext = createContext<MediaContextType | null>(null);

const STORAGE_PREFIX = "media_clip_";

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [clips, setClips] = useState<VideoMetadata[]>([]);
  const [isRehydrating, setIsRehydrating] = useState(true);

  // Rehydrate all stored media files on initial page load / refresh
  const loadStoredClips = async () => {
    setIsRehydrating(true);
    try {
      const allEntries = await entries();
      const loadedClips: VideoMetadata[] = [];

      for (const [key, value] of allEntries) {
        if (typeof key === "string" && key.startsWith(STORAGE_PREFIX)) {
          const record = value as StoredMediaRecord;
          if (record?.file) {
            try {
              // Re-instantiate Mediabunny Input from stored Blob/File
              const input = new Input({
                source: new BlobSource(record.file),
                formats: ALL_FORMATS,
              });

              const duration = await input.computeDuration();
              const videoTrack = await input.getPrimaryVideoTrack();
              const audioTrack = await input.getPrimaryAudioTrack();

              let dimensions;
              let rotation;
              let videoCodec;
              let audioCodec;

              if (videoTrack) {
                const [width, height] = await Promise.all([
                  videoTrack.getDisplayWidth(),
                  videoTrack.getDisplayHeight(),
                ]);
                dimensions = { width, height };
                rotation = videoTrack.rotation ?? 0;
                videoCodec = await videoTrack.getCodec();
              }

              if (audioTrack) {
                audioCodec = await audioTrack.getCodec();
              }

              loadedClips.push({
                id: record.id,
                input,
                duration,
                name: record.file.name,
                size: record.file.size,
                dimensions,
                rotation,
                videoCodec,
                audioCodec,
                hasVideo: !!videoTrack,
                hasAudio: !!audioTrack,
              });
            } catch (err) {
              console.error(`Failed to rehydrate video ${record.id}:`, err);
            }
          }
        }
      }

      setClips(loadedClips);
    } catch (err) {
      console.error("Error reading IndexedDB:", err);
    } finally {
      setIsRehydrating(false);
    }
  };

  useEffect(() => {
    loadStoredClips();
  }, []);

  // Save new clip to IndexedDB and state
  const addClip = async (
    file: File,
    metaBuilder: (input: Input) => Omit<VideoMetadata, "id" | "input">,
  ) => {
    const id = `${STORAGE_PREFIX}${Date.now()}_${file.name}`;

    // Store raw file handle in IndexedDB
    await set(id, { id, file } as StoredMediaRecord);

    const input = new Input({
      source: new BlobSource(file),
      formats: ALL_FORMATS,
    });

    const meta = metaBuilder(input);

    const newClip: VideoMetadata = {
      ...meta,
      id,
      input,
    };

    setClips((prev) => [...prev, newClip]);
  };

  // Remove individual clip from IndexedDB and state
  const removeClip = async (id: string) => {
    await del(id);
    setClips((prev) => prev.filter((c) => c.id !== id));
  };

  // Purge all clips from IndexedDB and state
  const clearAllClips = async () => {
    const allEntries = await entries();
    for (const [key] of allEntries) {
      if (typeof key === "string" && key.startsWith(STORAGE_PREFIX)) {
        await del(key);
      }
    }
    setClips([]);
  };

  return (
    <MediaContext.Provider
      value={{
        clips,
        isRehydrating,
        addClip,
        removeClip,
        clearAllClips,
        refreshClips: loadStoredClips,
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

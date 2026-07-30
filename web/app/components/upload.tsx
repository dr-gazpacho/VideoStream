import React, { useState } from "react";
import { Input, BlobSource, ALL_FORMATS } from "mediabunny";

export function Upload() {
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // Async Mediabunny operations go here safely!
      const input = new Input({
        source: new BlobSource(file),
        formats: ALL_FORMATS,
      });

      const videoDuration = await input.computeDuration();
      setDuration(videoDuration);
    } catch (err) {
      console.error("Failed to inspect video:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-zinc-900 text-zinc-100 rounded-md">
      <input type="file" accept="video/*" onChange={handleFileUpload} />
      {loading && <p className="text-amber-400">Analyzing video...</p>}
      {duration !== null && <p>Duration: {duration.toFixed(2)}s</p>}
    </div>
  );
}

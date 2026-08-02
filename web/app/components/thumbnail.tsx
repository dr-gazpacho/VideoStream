import { useEffect, useRef, useState } from "react";
import { type VideoMetadata } from "~/context/media-context";
import { getThumbnails } from "~/utils/thumbnaill.util";

export function ThumbnailItem({
  wrappedCanvas,
}: {
  wrappedCanvas: Awaited<ReturnType<typeof getThumbnails>>[number];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const targetCanvas = canvasRef.current;
    if (!targetCanvas || !wrappedCanvas) return;

    const ctx = targetCanvas.getContext("2d");
    if (!ctx) return;

    // set target canvas dimensions to match the thumbnail
    targetCanvas.width = wrappedCanvas.canvas.width;
    targetCanvas.height = wrappedCanvas.canvas.height;

    // draw the Mediabunny canvas onto the React-managed canvas
    ctx.drawImage(wrappedCanvas.canvas, 0, 0);
  }, [wrappedCanvas]);

  return (
    <div className="flex flex-col items-center gap-1">
      <canvas
        ref={canvasRef}
        className="rounded border border-gray-700 bg-black shadow-md"
      />
      <span className="text-xs text-gray-400">
        {wrappedCanvas.timestamp.toFixed(1)}s
      </span>
    </div>
  );
}

export function ThumbnailStrip({
  videoMetadata,
}: {
  videoMetadata: VideoMetadata;
}) {
  const [thumbnails, setThumbnails] = useState<
    Awaited<ReturnType<typeof getThumbnails>>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadThumbnails() {
      setLoading(true);
      try {
        const results = await getThumbnails(videoMetadata);
        if (results) {
          setThumbnails(results);
        }
      } catch (err) {
        console.error("Failed to generate thumbnails:", err);
      } finally {
        setLoading(false);
      }
    }

    if (videoMetadata) {
      loadThumbnails();
    }
  }, [videoMetadata]);

  if (loading) return <div>Generating thumbnails...</div>;

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-gray-900 rounded-lg">
      {thumbnails?.map((item, index) => (
        <ThumbnailItem key={index} wrappedCanvas={item} />
      ))}
    </div>
  );
}

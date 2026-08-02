import { NavLink } from "react-router";
import { type VideoMetadata } from "~/context/media-context";

interface EmptyMediaLibraryProps {
  clips: VideoMetadata[];
}

export function EmptyMediaLibrary({ clips }: EmptyMediaLibraryProps) {
  const hasNoClips = clips.length === 0;

  if (!hasNoClips) return null;

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4">
      <p className="text-zinc-400">You have no media in your library</p>

      <NavLink
        to="/video-upload"
        className={({ isActive, isPending }) =>
          [
            "relative px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-lime-400",
            isPending ? "text-lime-300 animate-pulse bg-zinc-900" : "",
            isActive
              ? "text-zinc-950 bg-lime-500 font-bold shadow-sm"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900",
          ]
            .filter(Boolean)
            .join(" ")
        }
      >
        {({ isActive, isPending }) => (
          <span className="flex items-center gap-2">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                isActive
                  ? "bg-zinc-950"
                  : isPending
                    ? "animate-ping bg-lime-400"
                    : "bg-zinc-700"
              }`}
            />
            {"Upload"}
          </span>
        )}
      </NavLink>
    </div>
  );
}

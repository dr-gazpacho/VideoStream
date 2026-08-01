import { NavLink } from "react-router";
import { type VideoMetadata } from "~/context/media-context";

interface EmptyMediaLibraryProps {
  clips: VideoMetadata[];
}

export function EmtpyMediaLibrary({ clips }: EmptyMediaLibraryProps) {
  const hasNoClips = !!!clips.length;
  return (
    <>
      {hasNoClips && (
        <div>
          <main className="h-full flex items-center">
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
          </main>
        </div>
      )}
    </>
  );
}

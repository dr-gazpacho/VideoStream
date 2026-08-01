export interface TranscodingProgress {
  time: number;
  percent: number;
}

interface TranscodingProgressDisplayProps {
  progress: TranscodingProgress;
  label?: string;
  onCancel?: () => void;
}

export function TranscodingProgressDisplay({
  progress,
  label = "Transcoding Stream",
  onCancel,
}: TranscodingProgressDisplayProps) {
  const clampedPercent = Math.min(100, Math.max(0, progress.percent));
  const formattedPercent = clampedPercent.toFixed(1);
  const formattedTime = progress.time.toFixed(1);

  return (
    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm font-mono text-xs space-y-2.5">
      <div className="flex flex-col gap-1.5 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          <span className="text-amber-500 font-bold uppercase tracking-wider">
            // {label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-zinc-400">
          <span>
            TIME: <strong className="text-amber-400">{formattedTime}s</strong>
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-zinc-500 uppercase tracking-widest">
            PROGRESS
          </span>
          <span className="text-amber-400">{formattedPercent}%</span>
        </div>

        {/* track */}
        <div className="h-2 w-full bg-zinc-900 border border-zinc-800/80 rounded-xs overflow-hidden p-[1px]">
          {/* animated fill */}
          <div
            className="h-full bg-amber-500 transition-all duration-150 ease-out rounded-xs relative"
            style={{ width: `${clampedPercent}%` }}
          >
            {/* glow effect */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          </div>
        </div>
      </div>

      {/* optional controls */}
      {onCancel && (
        <div className="flex justify-end pt-1 border-t border-zinc-900">
          <button
            onClick={onCancel}
            className="text-[10px] text-zinc-500 hover:text-red-400 uppercase tracking-wider transition-colors"
          >
            [ Cancel Operation ]
          </button>
        </div>
      )}
    </div>
  );
}

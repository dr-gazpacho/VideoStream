import React, { useEffect, useState } from "react";
import { useMediaLibrary } from "~/context/media-context";

interface StorageEstimate {
  usageMB: string;
  quotaMB: string;
  percentUsed: string;
}

export function StorageInspector() {
  const { clips, removeClip, clearAllClips, isRehydrating } = useMediaLibrary();
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);

  const calculateStorage = async () => {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      const usageMB = (usage / (1024 * 1024)).toFixed(1);
      const quotaMB = (quota / (1024 * 1024 * 1024)).toFixed(1); // Quota in GB
      const percentUsed = quota > 0 ? ((usage / quota) * 100).toFixed(2) : "0";

      setEstimate({
        usageMB,
        quotaMB: `${quotaMB} GB`,
        percentUsed,
      });
    }
  };

  useEffect(() => {
    calculateStorage();
  }, [clips]);

  const handleDeleteItem = async (id: string) => {
    await removeClip(id);
    await calculateStorage();
  };

  const handleClearAll = async () => {
    if (confirm("Delete all stored clips from browser storage?")) {
      await clearAllClips();
      await calculateStorage();
    }
  };

  return (
    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-sm font-mono text-zinc-100 space-y-4 max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <h3 className="text-xs font-bold uppercase text-amber-500 tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-xs bg-amber-500" />
          // Storage Telemetry
        </h3>
        {estimate && (
          <span className="text-[10px] text-zinc-400 uppercase">
            {estimate.usageMB} MB Used / {estimate.quotaMB}
          </span>
        )}
      </div>

      {/* Storage Progress Bar */}
      {estimate && (
        <div className="space-y-1">
          <div className="w-full bg-zinc-900 border border-zinc-800 h-2 rounded-xs overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${Math.max(Number(estimate.percentUsed), 1)}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 text-right uppercase">
            {estimate.percentUsed}% Allocated Space Used
          </p>
        </div>
      )}

      {/* Individual Storage Items List */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] uppercase text-zinc-500 border-b border-zinc-900 pb-1">
          <span>Persisted Clip ({clips.length})</span>
          <span>Size / Action</span>
        </div>

        {isRehydrating ? (
          <p className="text-xs text-amber-400 animate-pulse py-2">
            Rehydrating active clips from IndexedDB...
          </p>
        ) : clips.length === 0 ? (
          <p className="text-xs text-zinc-600 py-2">
            No video clips in local database.
          </p>
        ) : (
          <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {clips.map((clip) => (
              <li
                key={clip.id}
                className="flex items-center justify-between p-2 bg-zinc-900/80 border border-zinc-800/80 rounded-xs text-xs hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate text-zinc-200" title={clip.name}>
                    {clip.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-zinc-400 text-[11px]">
                    {(clip.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(clip.id)}
                    className="text-[10px] uppercase px-2 py-0.5 bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 rounded-xs border border-zinc-700 transition-colors"
                  >
                    Purge
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Global Actions */}
      {clips.length > 0 && (
        <div className="pt-2 border-t border-zinc-900 flex justify-end">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-zinc-900 text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-xs transition-colors"
          >
            Clear All Storage
          </button>
        </div>
      )}
    </div>
  );
}

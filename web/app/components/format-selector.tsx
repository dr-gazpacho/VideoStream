import {
  SUPPORTED_OUTPUT_FORMATS,
  type OutputFormatKey,
} from "~/utils/metadata.util";

interface FormatSelectorProps {
  selectedFormat: OutputFormatKey;
  onChange: (format: OutputFormatKey) => void;
  disabled?: boolean;
}

export function FormatSelector({
  selectedFormat,
  onChange,
  disabled = false,
}: FormatSelectorProps) {
  const formatKeys = Object.keys(SUPPORTED_OUTPUT_FORMATS) as OutputFormatKey[];

  return (
    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm font-mono space-y-2">
      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block border-b border-zinc-800/80 pb-1">
        // Target Container
      </span>

      <div className="grid grid-cols-2 gap-1.5">
        {formatKeys.map((key) => {
          const format = SUPPORTED_OUTPUT_FORMATS[key];
          const isSelected = selectedFormat === key;

          return (
            <label
              key={key}
              className={`flex items-center justify-between p-2 rounded-xs border cursor-pointer transition-colors text-xs ${
                isSelected
                  ? "bg-lime-500/10 border-lime-500/50 text-lime-400 font-bold"
                  : "bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="output-format"
                  value={key}
                  checked={isSelected}
                  onChange={() => onChange(key)}
                  disabled={disabled}
                  className="accent-lime-500 bg-zinc-900 border-zinc-700"
                />
                <span className="uppercase text-[11px]">{key}</span>
              </div>
              <span className="text-[9px] text-zinc-500 font-normal">
                .{format.ext}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

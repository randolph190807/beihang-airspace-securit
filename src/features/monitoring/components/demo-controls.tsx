import { useMonitoring } from "@/features/monitoring/monitoring-context";
import type { DemoSegment } from "@/features/monitoring/types";

const SEGMENTS: Array<{ segment: DemoSegment; label: string }> = [
  { segment: "alert", label: "警报" },
  { segment: "unknown", label: "不明" },
  { segment: "warning", label: "预警" },
];

export function DemoControls() {
  const {
    scene,
    showTrack,
    toggleTrack,
    startSegment,
    startAll,
    resetDemo,
    speedMultiplier,
    setSpeedMultiplier,
  } = useMonitoring();

  if (!scene) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-cyan-200/10 bg-[#06162f]/80 px-4 py-3">
      {SEGMENTS.map(({ segment, label }) => (
        <button
          key={segment}
          type="button"
          onClick={() => void startSegment(segment)}
          className="rounded-md border border-cyan-200/20 bg-cyan-200/10 px-3 py-1.5 text-sm text-cyan-50 hover:bg-cyan-200/20"
        >
          {label}
        </button>
      ))}

      <button
        type="button"
        onClick={() => void startAll()}
        className="rounded-md border border-amber-200/25 bg-amber-300/15 px-3 py-1.5 text-sm font-medium text-amber-100 hover:bg-amber-300/25"
      >
        全部开始
      </button>

      <button
        type="button"
        onClick={() => void resetDemo()}
        className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-blue-100/70 hover:bg-white/5"
      >
        重置
      </button>

      <label className="ml-auto flex items-center gap-2 text-sm text-blue-100/65">
        <input
          type="checkbox"
          checked={showTrack}
          onChange={toggleTrack}
          className="rounded border-cyan-200/30"
        />
        显示航迹
      </label>

      <div className="flex items-center gap-2 text-sm text-blue-100/65">
        <span>速度</span>
        {scene.demoTiming.presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => void setSpeedMultiplier(preset)}
            className={[
              "rounded px-2 py-1 text-xs",
              speedMultiplier === preset
                ? "bg-cyan-200/20 text-cyan-50"
                : "border border-white/10 text-blue-100/55 hover:bg-white/5",
            ].join(" ")}
          >
            {preset}×
          </button>
        ))}
      </div>
    </div>
  );
}

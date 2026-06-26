import { useMonitoring } from "@/features/monitoring/monitoring-context";
import { normToViewBox } from "@/features/monitoring/lib/coordinates";
import { THREAT_COLORS, type ThreatLevel } from "@/features/monitoring/types";

function threatLabel(level: ThreatLevel) {
  const map: Record<ThreatLevel, string> = {
    friendly: "己方",
    none: "鸟群",
    normal: "非威胁",
    warning: "预警",
    alert: "警报",
    disposed: "已处置",
  };
  return map[level];
}

export function TargetList() {
  const { targets, selectedTargetId, selectTarget, scene } = useMonitoring();

  if (!scene) return null;

  const list = targets.filter((t) => t.visible);

  return (
    <aside className="flex h-full flex-col rounded-lg border border-cyan-200/10 bg-[#06162f]/90">
      <div className="border-b border-cyan-200/10 px-4 py-3">
        <h3 className="font-semibold text-cyan-50">目标列表</h3>
        <p className="mt-1 text-xs text-blue-100/45">点击定位目标</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {list.map((target) => {
          const active = selectedTargetId === target.targetId;
          return (
            <button
              key={target.targetId}
              type="button"
              onClick={() => selectTarget(target.targetId)}
              className={[
                "w-full rounded-md border p-3 text-left transition-colors",
                active
                  ? "border-cyan-200/30 bg-cyan-200/10"
                  : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-cyan-50">{target.callsign}</span>
                <span
                  className="text-xs font-medium"
                  style={{ color: THREAT_COLORS[target.threatLevel] }}
                >
                  {threatLabel(target.threatLevel)}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-blue-100/55">
                <span>{target.metadata?.model ?? target.category}</span>
                <span>{Math.round(target.altitudeM)}m</span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

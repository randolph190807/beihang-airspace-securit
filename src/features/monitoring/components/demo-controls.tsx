import { useEffect, useRef } from "react";
import { useMonitoring } from "@/features/monitoring/monitoring-context";
import { type ThreatLevel } from "@/features/monitoring/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const THREAT_PRIORITY: Record<ThreatLevel, number> = {
  alert: 5,
  warning: 4,
  normal: 3,
  friendly: 2,
  none: 1,
  disposed: 0,
};

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

function ThreatNotifier({ onProcessTarget }: { onProcessTarget?: (targetId: string) => void }) {
  const { targets } = useMonitoring();
  const previousThreatRef = useRef<Record<string, ThreatLevel>>({});
  const notifiedAlertIdsRef = useRef<Set<string>>(new Set());
  const notifiedEscalationKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const nextThreatMap: Record<string, ThreatLevel> = {};
    const activeAlertIds = new Set<string>();

    for (const target of targets) {
      nextThreatMap[target.targetId] = target.threatLevel;
      const previousThreat = previousThreatRef.current[target.targetId];

      if (target.visible && target.threatLevel === "alert") {
        activeAlertIds.add(target.targetId);

        if (!notifiedAlertIdsRef.current.has(target.targetId)) {
          toast.error(`${target.callsign} 当前处于高危警报状态`, {
            id: `threat-alert-${target.targetId}`,
            description: "目标已进入高危态势，请尽快研判处置。",
            duration: 12000,
            action: onProcessTarget
              ? {
                  label: "处理",
                  onClick: () => onProcessTarget(target.targetId),
                }
              : undefined,
          });
          notifiedAlertIdsRef.current.add(target.targetId);
        }
      }

      if (
        target.visible &&
        previousThreat &&
        THREAT_PRIORITY[target.threatLevel] > THREAT_PRIORITY[previousThreat]
      ) {
        const escalationKey = `${target.targetId}-${previousThreat}-${target.threatLevel}`;

        if (!notifiedEscalationKeysRef.current.has(escalationKey)) {
          toast.warning(`${target.callsign} 危险等级升高至${threatLabel(target.threatLevel)}`, {
            id: `threat-rise-${target.targetId}-${target.threatLevel}`,
            description: "建议立即进入研判面板确认处置方案。",
            duration: 12000,
            action: onProcessTarget
              ? {
                  label: "处理",
                  onClick: () => onProcessTarget(target.targetId),
                }
              : undefined,
          });
          notifiedEscalationKeysRef.current.add(escalationKey);
        }
      }
    }

    previousThreatRef.current = nextThreatMap;
    notifiedAlertIdsRef.current.forEach((targetId) => {
      if (activeAlertIds.has(targetId)) return;
      notifiedAlertIdsRef.current.delete(targetId);
      toast.dismiss(`threat-alert-${targetId}`);
    });
  }, [onProcessTarget, targets]);

  return null;
}

export function DemoControls({
  onProcessTarget,
}: {
  onProcessTarget?: (targetId: string) => void;
}) {
  const {
    scene,
    showTrack,
    hideNonThreat,
    toggleTrack,
    toggleHideNonThreat,
    startAll,
    resetDemo,
  } = useMonitoring();

  if (!scene) return null;

  return (
    <div
      className={cn([
        "h-14",
        "flex flex-wrap items-center gap-2 rounded-t-md border-cyan-200/10  px-3 py-2 bg-[#06162f] border-b z-[1]",
      ])}
    >
      <button
        type="button"
        onClick={() => void startAll()}
        className="rounded border border-amber-200/25 bg-amber-300/15 px-2.5 py-1 text-xs font-medium text-amber-100 hover:bg-amber-300/25"
      >
        全部开始
      </button>

      <button
        type="button"
        onClick={() => void resetDemo()}
        className="rounded border border-white/10 px-2.5 py-1 text-xs text-blue-100/70 hover:bg-white/5"
      >
        重置
      </button>

      <ThreatNotifier onProcessTarget={onProcessTarget} />

      <label className="flex items-center gap-2 text-xs text-blue-100/65 xl:ml-auto">
        <input
          type="checkbox"
          checked={hideNonThreat}
          onChange={toggleHideNonThreat}
          className="rounded border-cyan-200/30"
        />
        隐藏非威胁
      </label>

      <label className="flex items-center gap-2 text-xs text-blue-100/65">
        <input
          type="checkbox"
          checked={showTrack}
          onChange={toggleTrack}
          className="rounded border-cyan-200/30"
        />
        显示航迹
      </label>
    </div>
  );
}

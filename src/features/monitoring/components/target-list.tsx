import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  AlertTriangle,
  Bird,
  Plane,
  Radar,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { useMonitoring } from "@/features/monitoring/monitoring-context";
import { THREAT_COLORS, type AircraftType, type ThreatLevel } from "@/features/monitoring/types";

const NODE_LEGENDS = [
  { key: "bird", label: "鸟群", color: THREAT_COLORS.none, Icon: Bird },
  { key: "friendly", label: "己方", color: THREAT_COLORS.friendly, Icon: ShieldCheck },
  { key: "normal", label: "非危险", color: THREAT_COLORS.normal, Icon: ScanSearch },
  { key: "alert", label: "警报", color: THREAT_COLORS.alert, Icon: AlertTriangle },
] as const;

type LegendFilterKey = (typeof NODE_LEGENDS)[number]["key"] | null;

const THREAT_PRIORITY: Record<ThreatLevel, number> = {
  alert: 5,
  warning: 4,
  unknown: 3,
  normal: 2,
  friendly: 1,
  none: 1,
  disposed: 0,
};

function threatLabel(level: ThreatLevel) {
  const map: Record<ThreatLevel, string> = {
    friendly: "己方",
    none: "鸟群",
    normal: "非威胁",
    unknown: "未知",
    warning: "预警",
    alert: "警报",
    disposed: "已处置",
  };
  return map[level];
}

function aircraftTypeLabel(type?: AircraftType) {
  const map: Record<AircraftType, string> = {
    fixed_wing: "固定翼",
    multirotor: "多旋翼",
    helicopter: "无人直升机",
    unknown: "未知机型",
  };
  return map[type ?? "unknown"];
}

function targetAccentColor(target: { category: string; threatLevel: ThreatLevel }) {
  if (target.category === "bird_flock") return THREAT_COLORS.none;
  return THREAT_COLORS[target.threatLevel];
}

function targetIcon(target: { category: string; threatLevel: ThreatLevel }) {
  if (target.category === "bird_flock") return Bird;
  if (target.threatLevel === "friendly") return ShieldCheck;
  if (target.threatLevel === "normal") return ScanSearch;
  if (target.threatLevel === "unknown") return Radar;
  if (target.threatLevel === "alert" || target.threatLevel === "warning") {
    return AlertTriangle;
  }
  return Radar;
}

export function TargetList({ onTargetSelect }: { onTargetSelect?: (targetId: string) => void }) {
  const { targets, selectedTargetId, selectTarget, scene, alertCounts } = useMonitoring();
  const [animatedTargetIds, setAnimatedTargetIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<LegendFilterKey>(null);
  const previousThreatRef = useRef<Record<string, ThreatLevel>>({});
  const animationTimeoutRef = useRef<number | null>(null);

  if (!scene) return null;

  const list = useMemo(
    () =>
      targets
        .filter((target) => target.visible)
        .filter((target) => {
          if (!activeFilter) return true;
          if (activeFilter === "bird") return target.category === "bird_flock";
          if (activeFilter === "friendly") return target.threatLevel === "friendly";
          if (activeFilter === "normal") return target.threatLevel === "normal";
          return target.threatLevel === "alert" || target.threatLevel === "warning";
        })
        .sort((a, b) => {
          const priorityDiff = THREAT_PRIORITY[b.threatLevel] - THREAT_PRIORITY[a.threatLevel];
          if (priorityDiff !== 0) return priorityDiff;
          return a.callsign.localeCompare(b.callsign);
        }),
    [activeFilter, targets],
  );

  useEffect(() => {
    const changedIds: string[] = [];
    const nextThreatMap: Record<string, ThreatLevel> = {};
    const persistentAlertIds = targets
      .filter((target) => target.visible && target.threatLevel === "alert")
      .map((target) => target.targetId);

    for (const target of targets) {
      nextThreatMap[target.targetId] = target.threatLevel;
      const previousThreat = previousThreatRef.current[target.targetId];
      if (previousThreat && previousThreat !== target.threatLevel) {
        changedIds.push(target.targetId);
      }
    }

    previousThreatRef.current = nextThreatMap;

    setAnimatedTargetIds((prev) => {
      if (changedIds.length === 0) {
        return persistentAlertIds;
      }

      return Array.from(new Set([...persistentAlertIds, ...prev, ...changedIds]));
    });

    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }

    if (changedIds.length === 0) return;

    animationTimeoutRef.current = window.setTimeout(() => {
      setAnimatedTargetIds(persistentAlertIds);
      animationTimeoutRef.current = null;
    }, 1400);
  }, [targets]);

  useEffect(
    () => () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    },
    [],
  );

  return (
    <aside className="sticky top-0 flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-cyan-200/10 bg-[#06162f]">
      <div className="border-b border-cyan-200/10">
        <div className="flex items-center justify-between gap-3 px-3 h-14">
          <div className="flex items-center gap-3 text-xs">
            <h3 className="font-semibold text-cyan-50 text-base">目标列表</h3>
          </div>
          <span className=" text-[13px] text-blue-100 inline-flex items-center justify-end gap-1">
            <span className="text-red-100">{alertCounts.alert}项</span>
            <span>/</span>
            <span className="text-amber-100">{alertCounts.warning}项</span>
            <span>/</span>
            <span>{list.length}项</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2 border-t px-3 h-10 items-center justify-start border-cyan-200/10">
          {NODE_LEGENDS.map(({ key, label, color, Icon }) => {
            const active = activeFilter === key;

            return (
              <button
                key={label}
                type="button"
                onClick={() => setActiveFilter((current) => (current === key ? null : key))}
                title={label}
                className={[
                  "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] text-blue-100/60 transition-all",
                  active
                    ? "scale-110 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "hover:bg-white/5",
                ].join(" ")}
                style={{
                  borderColor: active ? `${color}AA` : `${color}26`,
                  backgroundColor: active ? `${color}24` : `${color}12`,
                }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {list.length === 0 && (
          <div className="flex h-full items-center justify-center rounded-lg border border-cyan-200/10 bg-white/[0.02] text-sm text-blue-100/45">
            当前筛选下暂无目标
          </div>
        )}
        {list.map((target) => {
          const active = selectedTargetId === target.targetId;
          const isThreatAnimating = animatedTargetIds.includes(target.targetId);
          const accentColor = targetAccentColor(target);
          const TargetIcon = targetIcon(target);
          return (
            <button
              key={target.targetId}
              type="button"
              onClick={() => {
                selectTarget(target.targetId);
                onTargetSelect?.(target.targetId);
              }}
              className={[
                "w-full rounded-xl border py-3 text-left transition-all duration-200 ",
                isThreatAnimating ? "target-alert-border" : "",
                active
                  ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_30px_rgba(8,145,178,0.14)]"
                  : "hover:bg-white/[0.05]",
              ].join(" ")}
              style={
                {
                  ["--target-alert-color" as string]: THREAT_COLORS[target.threatLevel],
                  borderColor: active ? `${accentColor}88` : `${accentColor}36`,
                  background: active
                    ? `linear-gradient(135deg, ${accentColor}2A, rgba(8,47,73,0.58))`
                    : "rgba(255,255,255,0.02)",
                } as CSSProperties
              }
            >
              <div className="flex items-center justify-between gap-2 px-3">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg border"
                    style={{
                      borderColor: active ? `${accentColor}7A` : `${accentColor}30`,
                      backgroundColor: active ? `${accentColor}22` : `${accentColor}12`,
                      color: active ? accentColor : `${accentColor}CC`,
                    }}
                  >
                    <TargetIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-medium text-cyan-50">{target.callsign}</div>
                  </div>
                </div>
                <span
                  className="rounded-full px-2 py-1 text-[11px] font-medium"
                  style={{
                    color: THREAT_COLORS[target.threatLevel],
                    backgroundColor: `${THREAT_COLORS[target.threatLevel]}1A`,
                  }}
                >
                  {threatLabel(target.threatLevel)}
                </span>
              </div>

              <div
                className="mt-3 rounded-lg border-y px-3.5 py-2"
                style={{
                  borderColor: active ? `${accentColor}2E` : `${accentColor}18`,
                  backgroundColor: active ? `${accentColor}14` : "rgba(8,26,49,0.65)",
                }}
              >
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-blue-100/40">
                      <ScanSearch className="h-3.5 w-3.5" />
                      高度
                    </span>
                    <span className="font-medium text-cyan-50">
                      {Math.round(target.altitudeM)}m
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-blue-100/40">
                      <Plane className="h-3.5 w-3.5" />
                      机型
                    </span>
                    <span className="text-cyan-50">
                      {aircraftTypeLabel(target.metadata?.aircraftType)}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-blue-100/45 px-3">
                <span>{target.headingText}</span>
                <span>{target.speedKmh > 0 ? `${target.speedKmh}km/h` : "巡逻中"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

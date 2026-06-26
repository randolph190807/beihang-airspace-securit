import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Brain,
  ClipboardList,
  ShieldAlert,
  Tag,
} from "lucide-react";
import {
  useAiStream,
  useJudgmentTemplate,
} from "@/features/judgment/hooks/use-judgment-template";
import { useMonitoring } from "@/features/monitoring/monitoring-context";
import { THREAT_COLORS, type ManualTag, type ThreatLevel } from "@/features/monitoring/types";

function threatText(level: ThreatLevel) {
  const map: Record<ThreatLevel, string> = {
    friendly: "己方",
    none: "无威胁",
    normal: "非威胁",
    warning: "预警",
    alert: "警报",
    disposed: "已处置",
  };
  return map[level];
}

function zoneText(zone: string) {
  const map: Record<string, string> = {
    outside: "管控区外",
    warning: "预警区",
    track: "跟踪区",
    counter: "反制区",
  };
  return map[zone] ?? zone;
}

function canDispatch(
  effectiveSegment: string,
  zone: string,
  manualOverride: ManualTag | null,
): boolean {
  if (zone === "outside") return false;
  if (effectiveSegment === "unknown") {
    return manualOverride === "alert" || manualOverride === "warning";
  }
  return effectiveSegment === "alert" || effectiveSegment === "warning";
}

export function JudgmentPanel() {
  const {
    targets,
    selectedTargetId,
    dispatchJudgment,
    isDispatched,
    applyManualTag,
  } = useMonitoring();

  const target = useMemo(
    () => targets.find((item) => item.targetId === selectedTargetId) ?? null,
    [targets, selectedTargetId],
  );

  const segment = target?.role === "demo" ? target.effectiveSegment : null;

  const { template, loading, error } = useJudgmentTemplate(segment);

  const streamKey = `${target?.targetId ?? "none"}-${segment ?? "none"}`;
  const { text: aiText, done: aiDone } = useAiStream(
    template?.aiAnalysis.fullText ?? "",
    template?.aiAnalysis.streamDelayMs ?? 1000,
    streamKey,
  );

  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSchemeId(null);
  }, [streamKey]);

  const schemes = template?.schemes ?? [];
  const activeSchemeId = selectedSchemeId ?? schemes.find((s) => s.recommended)?.id ?? schemes[0]?.id ?? null;

  const dispatched = target ? isDispatched(target.targetId) : false;
  const dispatchEnabled =
    target &&
    !dispatched &&
    canDispatch(target.effectiveSegment, target.zone, target.manualOverride);

  if (!target || target.role !== "demo" || !target.visible) {
    return (
      <aside className="flex h-full min-h-[520px] flex-col rounded-lg border border-cyan-200/10 bg-[#06162f]/90">
        <div className="border-b border-cyan-200/10 px-4 py-3">
          <h3 className="font-semibold text-cyan-50">预警研判</h3>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-blue-100/45">
          启动演示目标后，将在此展示研判信息
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full max-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-lg border border-cyan-200/10 bg-[#06162f]/90">
      <div className="border-b border-cyan-200/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-300" />
          <h3 className="font-semibold text-cyan-50">
            {template?.title ?? "预警研判"}
          </h3>
        </div>
        <p className="mt-1 text-xs text-blue-100/45">
          当前目标 {target.callsign}
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {template?.approachWarning && target.zone !== "outside" && (
          <div className="rounded-md border border-red-400/30 bg-red-950/30 px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-medium text-red-200">
              <AlertTriangle className="h-4 w-4" />
              {template.approachWarning.label}
            </div>
            <p className="mt-1 text-xs leading-5 text-red-100/70">
              {template.approachWarning.description}
            </p>
          </div>
        )}

        <section className="rounded-md border border-white/8 bg-white/[0.03] p-3">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-100">
            <ClipboardList className="h-4 w-4" />
            基本信息
          </h4>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <div>
              <dt className="text-blue-100/45">编号</dt>
              <dd className="font-medium text-cyan-50">{target.callsign}</dd>
            </div>
            <div>
              <dt className="text-blue-100/45">状态</dt>
              <dd style={{ color: THREAT_COLORS[target.threatLevel] }}>
                {threatText(target.threatLevel)}
              </dd>
            </div>
            <div>
              <dt className="text-blue-100/45">机型</dt>
              <dd className="text-cyan-50">{target.metadata?.model ?? "未知"}</dd>
            </div>
            <div>
              <dt className="text-blue-100/45">高度</dt>
              <dd className="text-cyan-50">{Math.round(target.altitudeM)}m</dd>
            </div>
            <div>
              <dt className="text-blue-100/45">速度</dt>
              <dd className="text-cyan-50">{target.speedKmh}km/h</dd>
            </div>
            <div>
              <dt className="text-blue-100/45">航向</dt>
              <dd className="text-cyan-50">{target.headingText}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-blue-100/45">所在圈层</dt>
              <dd className="text-cyan-50">{zoneText(target.zone)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-md border border-white/8 bg-white/[0.03] p-3">
          <h4 className="mb-3 text-sm font-medium text-cyan-100">监控记录</h4>
          {target.behaviorTimeline.length === 0 ? (
            <p className="text-xs text-blue-100/45">等待目标进入管控区域…</p>
          ) : (
            <ul className="space-y-2">
              {target.behaviorTimeline.map((event) => (
                <li
                  key={event.id}
                  className="flex gap-3 text-xs text-blue-100/70"
                >
                  <span className="shrink-0 font-mono text-cyan-100/55">
                    {event.timestamp}
                  </span>
                  <span>{event.label}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-white/8 bg-white/[0.03] p-3">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-100">
            <Brain className="h-4 w-4" />
            AI 判定
            {!aiDone && aiText && (
              <span className="ml-auto text-[10px] text-cyan-200/45">输出中…</span>
            )}
          </h4>
          {loading && (
            <p className="text-xs text-blue-100/45">加载研判模板…</p>
          )}
          {error && <p className="text-xs text-red-300">{error}</p>}
          {!loading && !error && (
            <p className="text-xs leading-6 text-blue-100/75">{aiText}</p>
          )}
        </section>

        {schemes.length > 0 && (
          <section className="rounded-md border border-white/8 bg-white/[0.03] p-3">
            <h4 className="mb-3 text-sm font-medium text-cyan-100">处置方案</h4>
            <div className="space-y-2">
              {schemes.map((scheme) => {
                const active = scheme.id === activeSchemeId;
                return (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => setSelectedSchemeId(scheme.id)}
                    className={[
                      "w-full rounded-md border p-3 text-left transition-colors",
                      active
                        ? "border-cyan-200/30 bg-cyan-200/10"
                        : "border-white/8 hover:bg-white/[0.04]",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-cyan-50">
                        {scheme.name}
                        {scheme.recommended && (
                          <span className="ml-2 text-xs text-amber-300">★推荐</span>
                        )}
                      </span>
                      <span className="text-xs text-emerald-200/80">
                        成功率 {scheme.successRate}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-blue-100/55">
                      {scheme.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-blue-100/45">
                      <span>范围 {scheme.range}</span>
                      <span>风险 {scheme.risk}</span>
                      <span>{scheme.constraint}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="rounded-md border border-white/8 bg-white/[0.03] p-3">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-100">
            <Tag className="h-4 w-4" />
            处理动作
          </h4>

          <button
            type="button"
            disabled={!dispatchEnabled || !activeSchemeId}
            onClick={() => {
              if (!activeSchemeId) return;
              void dispatchJudgment(target.targetId, activeSchemeId);
            }}
            className={[
              "w-full rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              dispatched
                ? "border border-cyan-300/30 bg-cyan-500/20 text-cyan-50"
                : dispatchEnabled
                  ? "border border-red-400/40 bg-red-500/20 text-red-50 hover:bg-red-500/30"
                  : "cursor-not-allowed border border-white/10 bg-white/5 text-blue-100/35",
            ].join(" ")}
          >
            {dispatched ? "已下发处置，等待处置结果" : "一键下发现场处置"}
          </button>

          {target.effectiveSegment === "unknown" && !target.manualOverride && (
            <p className="mt-2 text-[11px] text-amber-200/70">
              不明目标请先标记为「警报」或「预警」后再下发处置
            </p>
          )}

          <div className="mt-3 grid grid-cols-3 gap-2">
            {(
              [
                { tag: "alert" as ManualTag, label: "标记警报" },
                { tag: "friendly" as ManualTag, label: "标记白名单" },
                { tag: "normal" as ManualTag, label: "标记无风险" },
              ] as const
            ).map(({ tag, label }) => (
              <button
                key={tag}
                type="button"
                onClick={() => void applyManualTag(target.targetId, tag)}
                className={[
                  "rounded border px-2 py-1.5 text-[11px] transition-colors",
                  target.manualOverride === tag
                    ? "border-cyan-200/30 bg-cyan-200/15 text-cyan-50"
                    : "border-white/10 text-blue-100/60 hover:bg-white/5",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          {target.demoSegment === "unknown" && (
            <button
              type="button"
              onClick={() => void applyManualTag(target.targetId, "warning")}
              className={[
                "mt-2 w-full rounded border px-2 py-1.5 text-[11px] transition-colors",
                target.manualOverride === "warning"
                  ? "border-amber-300/30 bg-amber-300/15 text-amber-100"
                  : "border-white/10 text-blue-100/60 hover:bg-white/5",
              ].join(" ")}
            >
              标记预警
            </button>
          )}
        </section>
      </div>
    </aside>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Brain, Check, ChevronDown, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAiStream, useJudgmentTemplate } from "@/features/judgment/hooks/use-judgment-template";
import { useMonitoring } from "@/features/monitoring/monitoring-context";
import { cn } from "@/lib/utils";
import { THREAT_COLORS, type ManualTag, type ThreatLevel } from "@/features/monitoring/types";
import type { DispositionScheme } from "@/features/judgment/types";

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

function parseSuccessRate(value: string) {
  const numericValue = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : -1;
}

const MANUAL_TAG_OPTIONS: Array<{ tag: ManualTag; label: string }> = [
  { tag: "alert", label: "标记警报" },
  { tag: "friendly", label: "标记白名单" },
  { tag: "normal", label: "标记无风险" },
];

function getRecommendedScheme(schemes: DispositionScheme[]) {
  if (schemes.length === 0) return null;

  return schemes.reduce((best, current) => {
    return parseSuccessRate(current.successRate) > parseSuccessRate(best.successRate)
      ? current
      : best;
  }, schemes[0]);
}

export function JudgmentPanel({ className }: { className?: string }) {
  const { targets, selectedTargetId, dispatchJudgment, isDispatched, applyManualTag } =
    useMonitoring();

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
  const recommendedScheme = useMemo(() => getRecommendedScheme(schemes), [schemes]);
  const activeSchemeId = selectedSchemeId ?? (aiDone ? recommendedScheme?.id : null) ?? null;
  const selectedManualTag = useMemo(() => {
    const options =
      target?.demoSegment === "unknown"
        ? [...MANUAL_TAG_OPTIONS, { tag: "warning" as ManualTag, label: "标记预警" }]
        : MANUAL_TAG_OPTIONS;

    return options.find((option) => option.tag === target?.manualOverride) ?? null;
  }, [target?.demoSegment, target?.manualOverride]);

  const dispatched = target ? isDispatched(target.targetId) : false;
  const dispatchEnabled =
    target &&
    !dispatched &&
    canDispatch(target.effectiveSegment, target.zone, target.manualOverride);

  if (!target || target.role !== "demo" || !target.visible) {
    return (
      <aside
        className={cn(
          "flex h-full min-h-[520px] flex-col rounded-lg border border-cyan-200/10 bg-[#06162f]/90",
          className,
        )}
      >
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
    <aside
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-lg border border-cyan-200/10 bg-[#06162f]/90",
        className,
      )}
    >
      <div className="border-b border-cyan-200/10 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div
            className={cn([
              "min-w-0 font-semibold text-cyan-50 ",
              "inline-flex items-center justify-start gap-2",
            ])}
          >
            <h1>当前目标 {target.callsign}</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-gray-800/80 text-xs p-2 h-8 bg-gray-100"
                >
                  {selectedManualTag?.label ?? "点击标记飞行物"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {MANUAL_TAG_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.tag}
                    onSelect={() => void applyManualTag(target.targetId, option.tag)}
                    className="justify-between"
                  >
                    <span>{option.label}</span>
                    {target.manualOverride === option.tag && (
                      <Check className="h-4 w-4 text-cyan-200" />
                    )}
                  </DropdownMenuItem>
                ))}
                {target.demoSegment === "unknown" && (
                  <DropdownMenuItem
                    onSelect={() => void applyManualTag(target.targetId, "warning")}
                    className="justify-between"
                  >
                    <span>标记预警</span>
                    {target.manualOverride === "warning" && (
                      <Check className="h-4 w-4 text-cyan-200" />
                    )}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="mt-1 text-xs text-blue-100/45"></p>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <section className="rounded-md border border-gray-400/60 bg-gray-700/80 p-3 m-3">
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

        <section className="rounded-md border border-gray-400/60 bg-gray-700/80 p-3 m-3">
          <h4 className="mb-3 text-sm font-medium text-cyan-100">监控记录</h4>
          {target.behaviorTimeline.length === 0 ? (
            <p className="text-xs text-blue-100/45">等待目标进入管控区域…</p>
          ) : (
            <ul className="space-y-2">
              {target.behaviorTimeline.map((event) => (
                <li key={event.id} className="flex gap-3 text-xs text-blue-100/70">
                  <span className="shrink-0 font-mono text-cyan-100/55">{event.timestamp}</span>
                  <span>{event.label}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-gray-400/60 bg-gray-700/80 p-3 m-3">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-100">
            <Brain className="h-4 w-4" />
            AI 判定
            {!aiDone && aiText && (
              <span className="ml-auto text-[10px] text-cyan-200/45">输出中…</span>
            )}
          </h4>
          {loading && <p className="text-xs text-blue-100/45">加载研判模板…</p>}
          {error && <p className="text-xs text-red-300">{error}</p>}
          {!loading && !error && <p className="text-xs leading-6 text-blue-100/75">{aiText}</p>}
        </section>
      </div>

      <div className="sticky bottom-0 shrink-0 border-t border-cyan-200/10 bg-[#06162f]/95 p-4 backdrop-blur">
        {schemes.length > 0 && (
          <section className="">
            <div className="mb-3 empty:hidden">
              {!aiDone && (
                <span className="text-[11px] text-blue-100/45">AI判定完成后展示推荐与成功率</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {schemes.map((scheme) => {
                const active = scheme.id === activeSchemeId;
                const isRecommended = aiDone && scheme.id === recommendedScheme?.id;

                return (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => setSelectedSchemeId(scheme.id)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      active
                        ? "border-cyan-200 bg-cyan-900/70 shadow-[0_0_0_1px_rgba(165,243,252,0.15)]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-cyan-50">{scheme.name}</span>
                          {isRecommended && (
                            <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-200">
                              推荐
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs leading-5 text-blue-100/55">
                          {scheme.description}
                        </p>
                      </div>
                      {aiDone && (
                        <span className="shrink-0 text-[11px] font-medium text-emerald-200/85">
                          {scheme.successRate}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-blue-100/45">
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

        <button
          type="button"
          disabled={!dispatchEnabled || !activeSchemeId}
          onClick={() => {
            if (!activeSchemeId) return;
            void dispatchJudgment(target.targetId, activeSchemeId);
          }}
          className={[
            "mt-3 w-full rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
            dispatched
              ? "border border-cyan-300/30 bg-cyan-500/20 text-cyan-50"
              : dispatchEnabled
                ? "border border-red-400/40 bg-red-500/20 text-red-50 hover:bg-red-500/30"
                : "cursor-not-allowed border border-white/10 bg-white/5 text-blue-100/35",
          ].join(" ")}
        >
          {dispatched ? "已下发处置，等待处置结果" : "一键下发现场处理方案"}
        </button>

        {target.effectiveSegment === "unknown" && !target.manualOverride && (
          <p className="mt-2 text-[11px] text-amber-200/70">
            不明目标请先标记为「警报」或「预警」后再下发处置
          </p>
        )}
      </div>
    </aside>
  );
}

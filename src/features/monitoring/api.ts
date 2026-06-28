import { apiGet, apiPost } from "@/lib/api-client";
import type {
  DemoSegment,
  ManualTag,
  SceneConfig,
  TargetDefinition,
} from "@/features/monitoring/types";

export function fetchScene() {
  return apiGet<SceneConfig>("/api/v1/monitoring/scene");
}

export function fetchTargets() {
  return apiGet<{ targets: TargetDefinition[] }>("/api/v1/monitoring/targets");
}

export function postDemoStart(segment: DemoSegment) {
  return apiPost<{
    demoPhase: string;
    segment: DemoSegment;
    targetId: string;
    startedAt: string;
  }>("/api/v1/monitoring/demo/start", { segment });
}

export function postDemoStartAll() {
  return apiPost<{
    started: Array<{ segment: DemoSegment; targetId: string }>;
    startedAt: string;
  }>("/api/v1/monitoring/demo/start-all", {});
}

export function postDemoReset() {
  return apiPost<{
    demoPhase: string;
    activeSegment: null;
    resetAt: string;
  }>("/api/v1/monitoring/demo/reset", {});
}

export function postDemoTiming(speedMultiplier: number) {
  return apiPost<{
    speedMultiplier: number;
    alertToCoreSec: number;
    effectiveAlertToCoreSec: number;
  }>("/api/v1/monitoring/demo/timing", { speedMultiplier });
}

export function postManualTag(targetId: string, tag: ManualTag) {
  return apiPost<{
    targetId: string;
    manualOverride: ManualTag;
    effectiveSegment: DemoSegment | "unknown";
    threatLevel: string;
  }>(`/api/v1/monitoring/targets/${targetId}/manual-tag`, {
    tag,
    operator: "用户1",
  });
}

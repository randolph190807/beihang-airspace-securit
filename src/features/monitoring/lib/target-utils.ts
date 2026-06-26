import type {
  ManualTag,
  SceneConfig,
  TargetDefinition,
  TargetRuntime,
  ThreatLevel,
  ZoneLevel,
} from "@/features/monitoring/types";
import { detectZone } from "@/features/monitoring/lib/coordinates";

export function initialEffectiveSegment(
  target: TargetDefinition,
): TargetRuntime["effectiveSegment"] {
  if (target.demoSegment === "alert") return "alert";
  if (target.demoSegment === "warning") return "warning";
  return "unknown";
}

export function createRuntimeFromDefinition(
  target: TargetDefinition,
): TargetRuntime {
  const startPos =
    target.motion.type === "linear"
      ? target.motion.from
      : target.motion.vertices[0];

  const altitudeM =
    target.motion.type === "linear" ? target.motion.altitude.from : 0;

  const headingText =
    target.motion.type === "linear" ? target.motion.headingText : "巡逻";

  const speedKmh =
    target.motion.type === "linear" ? target.motion.speedKmh : 0;

  return {
    targetId: target.targetId,
    callsign: target.callsign,
    category: target.category,
    role: target.role,
    demoSegment: target.demoSegment,
    effectiveSegment: initialEffectiveSegment(target),
    visible: target.visible,
    motion: target.motion,
    metadata: target.metadata,
    position: { ...startPos },
    altitudeM,
    speedKmh,
    headingText,
    zone: "outside",
    threatLevel: target.threatLevel,
    baselineThreat: target.threatLevel,
    motionState: target.visible ? "flying" : "idle",
    manualOverride: null,
    dispositionStatus: "none",
    trackPoints: [],
    behaviorTimeline: [],
    updatedAt: new Date().toISOString(),
  };
}

export function resolveThreatLevel(
  target: TargetRuntime,
  zone: ZoneLevel,
): ThreatLevel {
  if (target.motionState === "disposed" || target.dispositionStatus === "completed") {
    return "disposed";
  }

  if (target.manualOverride === "alert") return "alert";
  if (target.manualOverride === "warning") return "warning";
  if (target.manualOverride === "friendly") return "friendly";
  if (target.manualOverride === "normal") return "normal";

  if (target.baselineThreat === "friendly") return "friendly";
  if (target.baselineThreat === "none" || target.category === "bird_flock") {
    return "none";
  }

  if (zone === "counter") return "alert";
  if (zone === "track") return "warning";
  if (zone === "warning") {
    return target.demoSegment === "warning" ? "warning" : "normal";
  }

  return "normal";
}

export function countAlerts(targets: TargetRuntime[]) {
  let alert = 0;
  let warning = 0;

  for (const target of targets) {
    if (!target.visible || target.motionState === "disposed") continue;
    if (target.threatLevel === "alert") alert += 1;
    if (target.threatLevel === "warning") warning += 1;
  }

  return { alert, warning };
}

export function applyManualTagToTarget(
  target: TargetRuntime,
  tag: ManualTag,
): TargetRuntime {
  const effectiveSegment =
    tag === "alert" ? "alert" : tag === "warning" ? "warning" : "unknown";

  return {
    ...target,
    manualOverride: tag,
    effectiveSegment,
    threatLevel: resolveThreatLevel(
      {
        ...target,
        manualOverride: tag,
        effectiveSegment,
      },
      target.zone,
    ),
  };
}

export function getZoneRadii(scene: SceneConfig) {
  return {
    warning: scene.zones.warning.radiusNorm,
    track: scene.zones.track.radiusNorm,
    counter: scene.zones.counter.radiusNorm,
  };
}

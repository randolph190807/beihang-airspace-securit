export type DemoSegment = "alert" | "unknown" | "warning";
export type MotionType = "polygonLoop" | "linear";
export type MotionState = "idle" | "flying" | "hovering" | "disposed";
export type ZoneLevel = "outside" | "warning" | "track" | "counter";
export type ThreatLevel =
  | "friendly"
  | "normal"
  | "warning"
  | "alert"
  | "none"
  | "disposed";
export type ManualTag = "alert" | "warning" | "friendly" | "normal";

export interface Point {
  x: number;
  y: number;
}

export interface PolygonLoopMotion {
  type: "polygonLoop";
  vertices: Point[];
  lapDurationSec: number;
}

export interface LinearMotion {
  type: "linear";
  from: Point;
  to: Point;
  toCoreSec: number;
  altitude: { from: number; to: number };
  speedKmh: number;
  headingText: string;
  onComplete: "hover";
}

export type TargetMotion = PolygonLoopMotion | LinearMotion;

export interface TargetDefinition {
  targetId: string;
  callsign: string;
  category: "uav" | "bird_flock" | "balloon" | "other";
  role: "background" | "demo";
  demoSegment?: DemoSegment;
  threatLevel: ThreatLevel;
  visible: boolean;
  motion: TargetMotion;
  metadata?: {
    model?: string;
    identity?: string;
  };
}

export interface SceneConfig {
  sceneId: string;
  title: string;
  venue: { name: string; center: Point };
  zones: {
    warning: { radiusNorm: number; label: string; rangeKm: number };
    track: { radiusNorm: number; label: string; rangeKm: number };
    counter: { radiusNorm: number; label: string; rangeKm: number };
  };
  coreArea: { name: string; polygon: Point[] };
  map: {
    viewBox: [number, number, number, number];
    radarPpi: { position: Point; diameterNorm: number };
  };
  legend: Array<{ key: string; label: string; color: string }>;
  demoTiming: {
    alertToCoreSec: number;
    unknownToCoreSec: number;
    warningToCoreSec: number;
    speedMultiplier: number;
    presets: number[];
  };
}

export interface BehaviorEvent {
  id: string;
  timestamp: string;
  label: string;
}

export interface TargetRuntime {
  targetId: string;
  callsign: string;
  category: TargetDefinition["category"];
  role: TargetDefinition["role"];
  demoSegment?: DemoSegment;
  effectiveSegment: DemoSegment | "unknown";
  visible: boolean;
  motion: TargetMotion;
  metadata?: TargetDefinition["metadata"];
  position: Point;
  altitudeM: number;
  speedKmh: number;
  headingText: string;
  zone: ZoneLevel;
  threatLevel: ThreatLevel;
  baselineThreat: ThreatLevel;
  motionState: MotionState;
  manualOverride: ManualTag | null;
  dispositionStatus: "none" | "in_progress" | "completed";
  trackPoints: Point[];
  behaviorTimeline: BehaviorEvent[];
  updatedAt: string;
}

export const SEGMENT_TARGET_MAP: Record<DemoSegment, string> = {
  alert: "U-004",
  unknown: "U-002",
  warning: "U-003",
};

export const THREAT_COLORS: Record<ThreatLevel, string> = {
  friendly: "#22c55e",
  none: "#94a3b8",
  normal: "#38bdf8",
  warning: "#eab308",
  alert: "#ef4444",
  disposed: "#64748b",
};

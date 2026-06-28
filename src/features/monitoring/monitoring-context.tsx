import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  fetchScene,
  fetchTargets,
  postDemoReset,
  postDemoStart,
  postDemoStartAll,
  postDemoTiming,
  postManualTag,
} from "@/features/monitoring/api";
import { postJudgmentDispatch } from "@/features/judgment/api";
import {
  detectZone,
  evalLinear,
  evalPolygonLoop,
} from "@/features/monitoring/lib/coordinates";
import {
  applyManualTagToTarget,
  countAlerts,
  createRuntimeFromDefinition,
  getZoneRadii,
  resolveThreatLevel,
} from "@/features/monitoring/lib/target-utils";
import { appendZoneBehaviorEvents } from "@/features/monitoring/lib/behavior-timeline";
import type {
  DemoSegment,
  ManualTag,
  SceneConfig,
  TargetRuntime,
} from "@/features/monitoring/types";
import { SEGMENT_TARGET_MAP } from "@/features/monitoring/types";

interface MonitoringContextValue {
  loading: boolean;
  error: string | null;
  scene: SceneConfig | null;
  targets: TargetRuntime[];
  selectedTargetId: string | null;
  showTrack: boolean;
  speedMultiplier: number;
  polygonOriginMs: number;
  segmentStartAt: Record<string, number>;
  selectTarget: (targetId: string | null) => void;
  toggleTrack: () => void;
  startSegment: (segment: DemoSegment) => Promise<void>;
  startAll: () => Promise<void>;
  resetDemo: () => Promise<void>;
  setSpeedMultiplier: (value: number) => Promise<void>;
  applyManualTag: (targetId: string, tag: ManualTag) => Promise<void>;
  dispatchJudgment: (targetId: string, schemeId: string) => Promise<void>;
  isDispatched: (targetId: string) => boolean;
  alertCounts: { alert: number; warning: number };
}

const MonitoringContext = createContext<MonitoringContextValue | null>(null);

function recomputeTarget(
  target: TargetRuntime,
  now: number,
  scene: SceneConfig,
  polygonOriginMs: number,
  segmentStartAt: Record<string, number>,
  speedMultiplier: number,
  showTrack: boolean,
): TargetRuntime {
  if (!target.visible || target.motionState === "disposed") {
    return target;
  }

  let position = target.position;
  let altitudeM = target.altitudeM;
  let motionState = target.motionState;
  const zoneRadii = getZoneRadii(scene);
  const center = scene.venue.center;

  if (target.motion.type === "polygonLoop" && target.motionState !== "hovering") {
    position = evalPolygonLoop(
      target.motion.vertices,
      target.motion.lapDurationSec,
      now,
      polygonOriginMs,
      speedMultiplier,
    );
    motionState = "flying";
  }

  if (target.motion.type === "linear") {
    const startAt = segmentStartAt[target.targetId];
    if (startAt && motionState !== "hovering") {
      const elapsed = (now - startAt) / 1000;
      const result = evalLinear(
        target.motion.from,
        target.motion.to,
        center,
        target.motion.toCoreSec,
        target.motion.altitude,
        elapsed,
        speedMultiplier,
      );
      position = result.position;
      altitudeM = result.altitudeM;
      motionState = result.done ? "hovering" : "flying";
    }
  }

  const zone = detectZone(position, center, zoneRadii);
  const threatLevel = resolveThreatLevel({ ...target, zone }, zone);

  let trackPoints = target.trackPoints;
  if (
    showTrack &&
    target.role === "demo" &&
    motionState === "flying" &&
    target.motion.type === "linear"
  ) {
    const last = trackPoints[trackPoints.length - 1];
    if (!last || distPoint(last, position) > 0.002) {
      trackPoints = [...trackPoints, { ...position }].slice(-120);
    }
  }

  return {
    ...target,
    position,
    altitudeM,
    zone,
    threatLevel,
    motionState,
    trackPoints,
    updatedAt: new Date().toISOString(),
  };
}

function distPoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function MonitoringProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scene, setScene] = useState<SceneConfig | null>(null);
  const [targets, setTargets] = useState<TargetRuntime[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [showTrack, setShowTrack] = useState(false);
  const [speedMultiplier, setSpeedMultiplierState] = useState(1);
  const [polygonOriginMs] = useState(() => Date.now());
  const [segmentStartAt, setSegmentStartAt] = useState<Record<string, number>>({});
  const [dispatchedTargetIds, setDispatchedTargetIds] = useState<string[]>([]);

  const sceneRef = useRef(scene);
  const targetsRef = useRef(targets);
  const segmentStartAtRef = useRef(segmentStartAt);
  const speedMultiplierRef = useRef(speedMultiplier);
  const showTrackRef = useRef(showTrack);
  const polygonOriginMsRef = useRef(polygonOriginMs);

  sceneRef.current = scene;
  targetsRef.current = targets;
  segmentStartAtRef.current = segmentStartAt;
  speedMultiplierRef.current = speedMultiplier;
  showTrackRef.current = showTrack;
  polygonOriginMsRef.current = polygonOriginMs;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [sceneData, targetData] = await Promise.all([
          fetchScene(),
          fetchTargets(),
        ]);
        if (cancelled) return;
        setScene(sceneData);
        setSpeedMultiplierState(sceneData.demoTiming.speedMultiplier);
        setTargets(targetData.targets.map(createRuntimeFromDefinition));
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载失败");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      const currentScene = sceneRef.current;
      if (!currentScene) {
        frame = requestAnimationFrame(tick);
        return;
      }

      const now = Date.now();
      setTargets((prev) =>
        prev.map((target) => {
          const next = recomputeTarget(
            target,
            now,
            currentScene,
            polygonOriginMsRef.current,
            segmentStartAtRef.current,
            speedMultiplierRef.current,
            showTrackRef.current,
          );

          if (
            target.role === "demo" &&
            next.zone !== target.zone &&
            next.visible
          ) {
            return {
              ...next,
              behaviorTimeline: appendZoneBehaviorEvents(
                next.behaviorTimeline,
                target.zone,
                next.zone,
                target.targetId,
              ),
            };
          }

          return next;
        }),
      );

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const launchTarget = useCallback((targetId: string) => {
    const now = Date.now();
    setSegmentStartAt((prev) => ({ ...prev, [targetId]: now }));
    setTargets((prev) =>
      prev.map((target) => {
        if (target.targetId !== targetId) return target;
        const startPos =
          target.motion.type === "linear"
            ? target.motion.from
            : target.position;
        return {
          ...target,
          visible: true,
          motionState: "flying",
          position: { ...startPos },
          trackPoints: [],
          behaviorTimeline: [],
        };
      }),
    );
  }, []);

  const startSegment = useCallback(
    async (segment: DemoSegment) => {
      await postDemoStart(segment);
      launchTarget(SEGMENT_TARGET_MAP[segment]);
      setSelectedTargetId(SEGMENT_TARGET_MAP[segment]);
    },
    [launchTarget],
  );

  const startAll = useCallback(async () => {
    await postDemoStartAll();
    const ids = Object.values(SEGMENT_TARGET_MAP);
    const now = Date.now();
    setSegmentStartAt((prev) => {
      const next = { ...prev };
      for (const id of ids) next[id] = now;
      return next;
    });
    setTargets((prev) =>
      prev.map((target) => {
        if (!ids.includes(target.targetId)) return target;
        const startPos =
          target.motion.type === "linear"
            ? target.motion.from
            : target.position;
        return {
          ...target,
          visible: true,
          motionState: "flying",
          position: { ...startPos },
          trackPoints: [],
          behaviorTimeline: [],
        };
      }),
    );
    setSelectedTargetId("U-004");
  }, []);

  const resetDemo = useCallback(async () => {
    await postDemoReset();
    const targetData = await fetchTargets();
    setSegmentStartAt({});
    setSelectedTargetId(null);
    setDispatchedTargetIds([]);
    setTargets(targetData.targets.map(createRuntimeFromDefinition));
  }, []);

  const setSpeedMultiplier = useCallback(async (value: number) => {
    const now = Date.now();
    const oldMultiplier = speedMultiplierRef.current;

    setSegmentStartAt((prev) => {
      const next: Record<string, number> = { ...prev };
      for (const [targetId, startAt] of Object.entries(prev)) {
        const target = targetsRef.current.find((t) => t.targetId === targetId);
        if (!target || target.motion.type !== "linear") continue;
        const elapsed = now - startAt;
        const progress = elapsed / oldMultiplier;
        next[targetId] = now - progress * value;
      }
      return next;
    });

    await postDemoTiming(value);
    setSpeedMultiplierState(value);
  }, []);

  const applyManualTag = useCallback(async (targetId: string, tag: ManualTag) => {
    await postManualTag(targetId, tag);
    setTargets((prev) =>
      prev.map((target) =>
        target.targetId === targetId
          ? applyManualTagToTarget(target, tag)
          : target,
      ),
    );
  }, []);

  const dispatchJudgment = useCallback(async (targetId: string, schemeId: string) => {
    await postJudgmentDispatch({ targetId, schemeId });
    setDispatchedTargetIds((prev) =>
      prev.includes(targetId) ? prev : [...prev, targetId],
    );
    setTargets((prev) =>
      prev.map((target) =>
        target.targetId === targetId
          ? { ...target, dispositionStatus: "in_progress" }
          : target,
      ),
    );
  }, []);

  const isDispatched = useCallback(
    (targetId: string) => dispatchedTargetIds.includes(targetId),
    [dispatchedTargetIds],
  );

  const alertCounts = useMemo(() => countAlerts(targets), [targets]);

  const value = useMemo<MonitoringContextValue>(
    () => ({
      loading,
      error,
      scene,
      targets,
      selectedTargetId,
      showTrack,
      speedMultiplier,
      polygonOriginMs,
      segmentStartAt,
      selectTarget: setSelectedTargetId,
      toggleTrack: () => setShowTrack((v) => !v),
      startSegment,
      startAll,
      resetDemo,
      setSpeedMultiplier,
      applyManualTag,
      dispatchJudgment,
      isDispatched,
      alertCounts,
    }),
    [
      loading,
      error,
      scene,
      targets,
      selectedTargetId,
      showTrack,
      speedMultiplier,
      polygonOriginMs,
      segmentStartAt,
      startSegment,
      startAll,
      resetDemo,
      setSpeedMultiplier,
      applyManualTag,
      dispatchJudgment,
      isDispatched,
      alertCounts,
    ],
  );

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring() {
  const ctx = useContext(MonitoringContext);
  if (!ctx) {
    throw new Error("useMonitoring must be used within MonitoringProvider");
  }
  return ctx;
}

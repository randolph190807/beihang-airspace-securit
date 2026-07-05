import { useState, type ReactNode } from "react";
import { useMonitoring } from "@/features/monitoring/monitoring-context";
import { normToViewBox } from "@/features/monitoring/lib/coordinates";
import { MapScaleControl, clampMapScale } from "@/features/monitoring/components/map-scale-control";
import { THREAT_COLORS, type ThreatLevel } from "@/features/monitoring/types";
import { cn } from "@/lib/utils";

const NON_DANGEROUS_LEVELS: ThreatLevel[] = ["friendly", "none", "normal"];

function getPolygonCenter(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }

  const total = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
}

export function MapCanvas({
  children,
  onTargetSelect,
}: {
  children?: ReactNode;
  onTargetSelect?: (targetId: string) => void;
}) {
  const [mapScale, setMapScale] = useState(1);
  const { scene, targets, selectedTargetId, selectTarget, showTrack, hideNonThreat } =
    useMonitoring();

  if (!scene) return null;

  const [vx, vy, vw, vh] = scene.map.viewBox;
  const center = normToViewBox(scene.venue.center, scene.map.viewBox);
  const radii = {
    warning: scene.zones.warning.radiusNorm * vw,
    track: scene.zones.track.radiusNorm * vw,
    counter: scene.zones.counter.radiusNorm * vw,
  };

  const ppi = scene.map.radarPpi;
  const ppiR = (ppi.diameterNorm * vw) / 2;

  const zoneStyles = {
    warning: {
      stroke: "rgba(14,165,233,1)",
      fill: "rgba(14,165,233,.2)",
    },
    track: {
      stroke: "rgba(245,158,11,1)",
      fill: "rgba(245,158,11,0.2)",
    },
    counter: {
      stroke: "rgba(239,68,68,1)",
      fill: "rgba(239,68,68,0.2)",
    },
    core: {
      stroke: "rgba(220,38,38,1)",
      fill: "rgba(220,38,38,0.2)",
    },
  };

  const coreCenter = normToViewBox(getPolygonCenter(scene.coreArea.polygon), scene.map.viewBox);
  const corePolygonPoints = scene.coreArea.polygon
    .map((point) => normToViewBox(point, scene.map.viewBox))
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const visibleTargets = targets.filter((target) => {
    if (!target.visible) return false;
    if (!hideNonThreat) return true;
    return !NON_DANGEROUS_LEVELS.includes(target.threatLevel);
  });

  const shouldRenderTrack = (target: (typeof visibleTargets)[number]) =>
    (showTrack || target.dispositionStatus === "in_progress") && target.trackPoints.length >= 2;

  return (
    <div
      className={cn([
        "overflow-hidden",
        "flex flex-col ",
        "relative h-full min-h-0 overflow-hidden rounded-lg border border-cyan-200/10 sm:h-[420px] xl:h-full",
      ])}
    >
      {children ? <div className="relative z-10">{children}</div> : null}
      <MapScaleControl value={mapScale} onChange={(value) => setMapScale(clampMapScale(value))} />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[0]"
        style={{
          transform: `scale(${mapScale})`,
          transformOrigin: "center center",
          transition: "transform 160ms ease-out",
          backgroundColor: "rgba(244, 245, 247, 0.94)",
          backgroundImage:
            "linear-gradient(to right, rgba(203,213,225,0.72) 1px, transparent 1px), linear-gradient(to bottom, rgba(203,213,225,0.72) 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        }}
      />
      <div className="absolute inset-0 z-[0] bg-white/20 backdrop-blur-[0px]" />

      <svg
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        className="relative z-[1] h-full w-full"
        role="img"
        aria-label="区域监控地图"
        style={{
          transform: `scale(${mapScale})`,
          transformOrigin: "center center",
          transition: "transform 160ms ease-out",
        }}
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.08)" />
            <stop offset="100%" stopColor="rgba(3,16,37,0)" />
          </radialGradient>
          <style>
            {`
              .selected-target-pulse {
                transform-box: fill-box;
                transform-origin: center;
                animation: selected-target-pulse 750ms linear infinite;
              }

              @keyframes selected-target-pulse {
                from {
                  transform: scale(0);
                  opacity: 1;
                }

                to {
                  transform: scale(3);
                  opacity: 0.2;
                }
              }
            `}
          </style>
        </defs>

        <rect x={0} y={0} width={vw} height={vh} fill="url(#mapGlow)" />

        <circle
          cx={center.x}
          cy={center.y}
          r={radii.warning}
          fill={zoneStyles.warning.fill}
          stroke={zoneStyles.warning.stroke}
          strokeWidth={4}
        />
        <circle
          cx={center.x}
          cy={center.y}
          r={radii.track}
          fill={zoneStyles.track.fill}
          stroke={zoneStyles.track.stroke}
          strokeWidth={4}
        />
        <circle
          cx={center.x}
          cy={center.y}
          r={radii.counter}
          fill={zoneStyles.counter.fill}
          stroke={zoneStyles.counter.stroke}
          strokeWidth={3}
        />

        <polygon
          points={corePolygonPoints}
          fill={zoneStyles.core.fill}
          stroke={zoneStyles.core.stroke}
          strokeWidth={4}
          strokeLinejoin="round"
        />

        <text
          x={coreCenter.x}
          y={coreCenter.y + 28}
          textAnchor="middle"
          fill="rgba(127,29,29,0.95)"
          stroke="rgba(255,255,255,0.92)"
          strokeWidth={1.2}
          paintOrder="stroke"
          fontSize={24}
          fontWeight={600}
        >
          {scene.coreArea.name}
        </text>

        {visibleTargets.map((target) => {
          if (!shouldRenderTrack(target)) return null;
          const points = target.trackPoints
            .map((p) => normToViewBox(p, scene.map.viewBox))
            .map((p) => `${p.x},${p.y}`)
            .join(" ");
          return (
            <polyline
              key={`track-${target.targetId}`}
              points={points}
              fill="none"
              stroke={THREAT_COLORS[target.threatLevel]}
              strokeWidth={target.dispositionStatus === "in_progress" ? 3 : 2}
              strokeOpacity={target.dispositionStatus === "in_progress" ? 1 : 0.82}
              strokeDasharray={target.dispositionStatus === "in_progress" ? "8 4" : undefined}
            />
          );
        })}

        {visibleTargets.map((target) => {
          const pos = normToViewBox(target.position, scene.map.viewBox);
          const selected = selectedTargetId === target.targetId;
          const color = THREAT_COLORS[target.threatLevel];
          const isProcessing = target.dispositionStatus === "in_progress";

          return (
            <g
              key={target.targetId}
              className="cursor-pointer"
              onClick={() => {
                selectTarget(target.targetId);
                onTargetSelect?.(target.targetId);
              }}
            >
              {isProcessing && (
                <>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={48}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeOpacity={0.95}
                    strokeDasharray="6 4"
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={36}
                    fill="rgba(239,68,68,0.18)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeOpacity={0.9}
                  />
                </>
              )}
              {selected && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={16}
                  fill={color}
                  stroke={color}
                  strokeWidth={0}
                  strokeOpacity={0.85}
                  className="selected-target-pulse"
                />
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={16}
                fill={color}
                stroke="rgba(255,255,255,0.95)"
                strokeWidth={2}
                style={{ filter: `drop-shadow(0 0 ${isProcessing ? 18 : 10}px ${color})` }}
              />
              <text
                x={pos.x + 22}
                y={pos.y - 10}
                fill="#0f172a"
                stroke="rgba(255,255,255,0.92)"
                strokeWidth={1.5}
                paintOrder="stroke"
                fontSize={27}
                fontWeight={500}
              >
                {target.callsign}
              </text>
              {isProcessing && (
                <text
                  x={pos.x + 22}
                  y={pos.y - 30}
                  fill="#ef4444"
                  stroke="rgba(255,255,255,0.88)"
                  strokeWidth={1}
                  paintOrder="stroke"
                  fontSize={20}
                  fontWeight={700}
                >
                  处理中
                </text>
              )}
              <text
                x={pos.x + 22}
                y={pos.y + 14}
                fill="rgba(15,23,42,0.88)"
                stroke="rgba(255,255,255,0.88)"
                strokeWidth={1}
                paintOrder="stroke"
                fontSize={27}
                fontWeight={500}
              >
                {Math.round(target.altitudeM)}m
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-[20px] left-[20px] z-[2] h-[92px] w-[92px]">
        <svg viewBox={`0 0 ${ppiR * 2} ${ppiR * 2}`} className="h-full w-full">
          <circle
            cx={ppiR}
            cy={ppiR}
            r={ppiR}
            fill="rgba(6,22,47,0.82)"
            stroke="rgba(34,211,238,0.42)"
            strokeWidth={2}
          />
          <g className="radar-sweep" style={{ transformOrigin: `${ppiR}px ${ppiR}px` }}>
            <line
              x1={ppiR}
              y1={ppiR}
              x2={ppiR}
              y2={ppiR * 0.15}
              stroke="rgba(34,211,238,0.9)"
              strokeWidth={2}
            />
            <path
              d={`M ${ppiR} ${ppiR} L ${ppiR} ${ppiR * 0.15} A ${ppiR} ${ppiR} 0 0 1 ${ppiR + ppiR * 0.22} ${ppiR - ppiR * 0.08} Z`}
              fill="rgba(34,211,238,0.16)"
            />
          </g>
        </svg>
      </div>

      <div className="absolute bottom-[20px] right-[20px] z-[2] rounded-md border border-cyan-200/10 bg-[#06162f]/90 p-2 text-xs text-blue-100/60">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          {scene.zones.warning.label} {scene.zones.warning.rangeKm}km
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          {scene.zones.track.label} {scene.zones.track.rangeKm}km
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          {scene.zones.counter.label} {scene.zones.counter.rangeKm}km
        </div>
      </div>
    </div>
  );
}
